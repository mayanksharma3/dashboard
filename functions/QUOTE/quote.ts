import Action from "../../utils/action";
import axios from "axios";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default": {
                const quote = await axios.get("http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en")
                let parsedQuote;
                if (typeof quote.data === "string") {
                    parsedQuote = JSON.parse(quote.data.split("\\").join(""));
                } else {
                    parsedQuote = quote.data;
                }
                return {quote: parsedQuote.quoteText, author: parsedQuote.quoteAuthor}
            }
            case "programmingQuote": {
                const quotes = require(__dirname + "/programming_quotes.json") as any[];
                const chosenQuote = quotes[this.randomInteger(0, quotes.length - 1)]
                return {quote: chosenQuote.en, author: chosenQuote.author}
            }
        }

    }

    randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
