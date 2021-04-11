import Action from "../../utils/action";
import axios from "axios";
import parser from "xml2json-ltx";

export default class extends Action {

    async preProcessing() {
        const xmlFetch = await axios.get("https://static.cricinfo.com/rss/livescores.xml")
        return {scores: JSON.parse(parser.toJson(xmlFetch.data)).rss.channel.item}
    }

}
