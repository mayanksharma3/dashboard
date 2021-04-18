import Action from "../../utils/action";
import Fuse from 'fuse.js';

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        const languages = require(__dirname + "/languages.json");
        const options = {
            keys: ['name', 'extensions']
        }
        const fuse = new Fuse(languages, options)
        return {scratchpad: true, language: fuse.search(args.variables["LANGUAGE"].toLowerCase())[0].item["name"].toLowerCase()}
    }

}
