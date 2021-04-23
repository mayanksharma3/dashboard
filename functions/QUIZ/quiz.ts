import Action from "../../utils/action";
import express from "express";
import axios from "axios";

export default class extends Action {

    async preProcessing() {
    }

    addRoutes() {
        const router = express.Router();
        router.get("/", async (req, res) => {
            const query = req.query;
            let apiURL = `https://opentdb.com/api.php?amount=${query.trivia_amount}`;
            if (query.trivia_category !== "any") {
                apiURL += `&category=${query.trivia_category}`
            }

            if (query.trivia_difficulty !== "any") {
                apiURL += `&difficulty=${query.trivia_difficulty}`
            }

            if (query.trivia_type !== "any") {
                apiURL += `&type=${query.trivia_type}`
            }
            const response = await axios.get(apiURL)
            res.send(response.data)
        });
        return router;
    }

}
