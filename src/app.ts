import express from "express";
import {tmdbRouter} from "./api/tmdb";

const app = express();
// register tmdb router
app.use('/tmdb', tmdbRouter);

app.listen(3000, function () {
    console.log('Skyhook TMDB listening on port 3000!');
});