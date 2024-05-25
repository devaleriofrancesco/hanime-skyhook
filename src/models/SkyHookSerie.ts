export interface SkyHookSerie {
    tvdbId: number;
    title: string;
    overview: string;
    slug: string;
    originalCountry: string;
    originalLanguage: string;
    language: string;
    firstAired: string;
    lastAired: string;
    tvMazeId: number | null;
    tmdbId: number;
    imdbId: string | null;
    lastUpdated: string;
    status: string;
    runtime: number | null;
    timeOfDay: TimeOfDay | null;
    originalNetwork: string;
    network: string;
    genres: string[];
    contentRating: string;
    alternateTitles: AlternativeTitle[];
    actors: object;
    images: object;
    seasons: object;
    episodes?: Episode[]
}

export interface AlternativeTitle {
    tvdbId: number;
    title: string;
}

export interface TimeOfDay {
    hours: number;
    minutes: number;
}

export interface Episode {
    tvdbShowId: number;
    tvdbId: number;
    seasonNumber: number;
    episodeNumber: number;
    airDate: string;
    airDateUtc: string;
    runtime: number;
}

export interface SkyHookImage {
    coverType: string;
    url: string;
}