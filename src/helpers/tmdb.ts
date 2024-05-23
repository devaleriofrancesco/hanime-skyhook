import {Images, TMDB, TvShowDetails} from '@francescodevalerio/tmdb-ts';
import {Episode, SkyHookImage, SkyHookSerie} from "../models/SkyHookSerie";
import moment from 'moment';
import slugify from "slugify";
import 'dotenv/config';

export class Tmdb {

    _movieDb: TMDB;
    IMAGES_BASE_URL = 'https://image.tmdb.org/t/p/original';
    HANIME_KEYWORD_ID = "198385";

    constructor() {
        this._movieDb = new TMDB(process.env.TMDB_API_KEY ?? 'NOKEY');
    }


    /**
     * Search show by term
     * @param term
     */
    async searchByTerm(term: string): Promise<SkyHookSerie[]> {
        const response = await this._movieDb.search.tvShows({
            query: term,
            include_adult: true,
        });
        return await Promise.all(response.results.filter(show => show.adult).map(async (show) => {
            return this.getSkyHookShow(show.id);
        }));
    }

    async searchById(tvdbId: number, includeEpisodes?: boolean | undefined): Promise<SkyHookSerie> {
        return this.getSkyHookShow(tvdbId, includeEpisodes);
    }

    async getLatestNews(pageNumber: number = 1): Promise<SkyHookSerie[]> {
        const today = moment();
        const news = await this._movieDb.discover.tvShow({
            include_adult: true,
            with_keywords: this.HANIME_KEYWORD_ID,
            "first_air_date.gte": today.subtract(1, "year").format('YYYY-MM-DD'),
            "first_air_date.lte": today.format('YYYY-MM-DD'),
            include_null_first_air_dates: true,
            sort_by: "first_air_date.desc",
            page: pageNumber,
            with_original_language: "ja",
        });
        const result: SkyHookSerie[] = [];
        for (const item of news.results) {
            result.push(await this.getSkyHookShow(item.id));
        }
        return result;
    }

    /**
     * Get SkyHook formatted show
     * @param tvdbId
     * @param includeEpisodes
     */
    async getSkyHookShow(tvdbId: number, includeEpisodes?: boolean | undefined): Promise<SkyHookSerie> {
        const details = await this._movieDb.tvShows
            .details(tvdbId);

        const images = await this._movieDb.tvShows
            .images(tvdbId);

        const alternativeTitles = await this._movieDb.tvShows
            .alternativeTitles(tvdbId);

        const newImages = this.mapImages(images, details);

        const episodesArray: Episode[] = [];
        if (includeEpisodes) {
            for (const s of details.seasons) {
                const episodes = await this.getEpisodes(details.id, s.season_number);
                for (const episode of episodes) {
                    episodesArray.push(episode);
                }
            }
        }

        return <SkyHookSerie>{
            tvdbId: details.id,
            title: details.name,
            overview: details.overview,
            slug: slugify(details.name, {
                lower: true,
                trim: true,
                strict: true
            }),
            originalCountry: details.origin_country.at(0) ?? 'jp',
            originalLanguage: details.original_language === 'ja' ? 'jpn' : null,
            language: 'eng',
            firstAired: details.first_air_date || null,
            lastAired: details.last_air_date || null,
            tvMazeId: null,
            tmdbId: details.id,
            imdbId: details.id.toString(),
            lastUpdated: details.last_air_date ? (moment(details.last_air_date)).utc().format() : null,
            status: this.mapStatus(details.status),
            runtime: null,
            timeOfDay: null,
            originalNetwork: details.production_companies.at(0)?.name ?? '-',
            network: details.production_companies.at(0)?.name ?? '-',
            genres: details.genres.map(genre => genre.name),
            contentRating: "TV-18",
            alternativeTitles: alternativeTitles.results?.map(title => title.title) ?? [],
            actors: [], // @TODO in the future
            images: newImages,
            seasons: details.seasons.map(season => {
                return {"seasonNumber": season.season_number}
            }),
            episodes: includeEpisodes ? episodesArray : []
        }
    }

    async getEpisodes(showId: number, seasonNumber: number): Promise<Episode[]> {
        const season = await this._movieDb.tvSeasons.details({
            tvShowID: showId,
            seasonNumber: seasonNumber
        });

        const episodesArray: Episode[] = [];
        for (const episodes of season.episodes) {
            episodesArray.push(<Episode>{
                tvdbId: episodes.id,
                airDate: episodes.air_date,
                runtime: episodes.runtime ?? 10,
                airDateUtc: moment(episodes.air_date).utc().format(),
                episodeNumber: episodes.episode_number,
                seasonNumber: episodes.season_number,
                tvdbShowId: episodes.show_id
            });
        }

        return episodesArray;
    }

    mapStatus(status: string): string {
        switch (status) {
            case 'Ended':
                break;
            case 'Returning Series':
                status = 'continuing';
                break;
            case 'Planned':
            case 'In Production':
                status = 'upcoming';
                break;
            default:
                status = 'continuing';
        }
        return status;
    }

    mapImages(images: Images, details: TvShowDetails): SkyHookImage[] {
        if (!images) {
            return [];
        }

        const imageArray = [];

        //check for posters
        if (images.posters.at(0) || details.poster_path) {
            imageArray.push({
                coverType: 'Poster',
                url: this.IMAGES_BASE_URL + (images.posters.at(0)?.file_path ?? details.poster_path)
            } as SkyHookImage);
        }

        // check for backdrops
        if (images.backdrops.at(0) || details.backdrop_path) {
            imageArray.push({
                coverType: 'Banner',
                url: this.IMAGES_BASE_URL + (images.backdrops.at(0)?.file_path ?? details.backdrop_path)
            } as SkyHookImage);
            imageArray.push({
                coverType: 'Fanart',
                url: this.IMAGES_BASE_URL + (images.backdrops.at(0)?.file_path ?? details.backdrop_path)
            } as SkyHookImage);
        }

        // check for logos
        if (images.logos.at(0)) {
            imageArray.push({
                coverType: 'Clearlogo',
                url: this.IMAGES_BASE_URL + (images.logos.at(0)?.file_path ?? '')
            } as SkyHookImage);
        }

        return imageArray;
    }

}