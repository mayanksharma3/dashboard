import Action from "../../utils/action";

const Feed = require('rss-to-json');

export default class implements Action {

    async preProcessing(args: string[]) {
        let query = ""
        const result: any = {}
        if (args.length > 0) {
            result.query = args.join(" ")
            query = "?q=" + result.query
        }
        result.news = await Feed.load('https://news.google.com/rss' + query);
        return result
    }

}
