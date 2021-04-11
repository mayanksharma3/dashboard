import Action from "../../utils/action";
import {extractRecipe} from "./utils";

export default class implements Action {

    async preProcessing(args: { id: string, variables: {[key: string]: string }}) {
        const res = await extractRecipe(args["URL"])
        return {recipe: res}
    }

}
