import Action from "../../utils/action";

const Feed = require('rss-to-json');

export default class extends Action {

    async preProcessing(args: { id: string, variables: {[key: string]: string }}) {
        console.log(args)
        let query = ""
        const result: any = {}
        if (args.id === "querySearch") {
            result.query = args.variables["QUERY"]
            query = "?q=" + result.query
        }
        result.news = await Feed.load('https://news.google.com/rss' + query);
        return result
    }

}
