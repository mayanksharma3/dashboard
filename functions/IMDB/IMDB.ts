import Action from "../../utils/action";
import axios from "axios";

export default class implements Action {

    async preProcessing(args: string[]) {
        const xmlFetch = await axios.get(`http://api.themoviedb.org/3/search/movie?query=${args.join(" ")}&api_key=4fecdf0b54d07c822019cc3591d88546`)
        console.log(xmlFetch.data)
        return {movie: xmlFetch.data.results[0]}
    }

}
