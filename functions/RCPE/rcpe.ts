import Action from "../../utils/action";
import {extractRecipe} from "./utils";

export default class extends Action {

    async preProcessing(args: { id: string, variables: {[key: string]: string }}) {
        const res = await extractRecipe(args.variables["URL"])
        return {recipe: res}
    }

}
