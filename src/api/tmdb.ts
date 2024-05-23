// tmdb.ts - TMBD route module.
import {Router} from "express";
import {Tmdb} from '../helpers/tmdb';

export const tmdbRouter = Router();
const tmdbHelper = new Tmdb();

// Home page route.
tmdbRouter.get("/search/:language", function (req, res) {
    const term: string = req.query?.term as string;
    tmdbHelper.searchByTerm(term)
        .then(r => res.json(r))
        .catch(e => console.log(e));
});

// About page route.
tmdbRouter.get("/shows/:language/:id", function (req, res) {
    const tvdbId = req.params?.id;
    tmdbHelper.searchById(parseInt(tvdbId), true)
        .then(r => res.json(r))
        .catch(e => console.log(e));
});

// latest news
tmdbRouter.get("/latest/:language/:pageNumber", function (req, res) {
    const pageNumber = req.params?.pageNumber || "1";
    tmdbHelper.getLatestNews(parseInt(pageNumber))
        .then(r => res.json(r))
        .catch(e => console.log(e));
});