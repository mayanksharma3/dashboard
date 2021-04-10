import Action from "../../utils/action";
import {extractRecipe} from "./utils";

export default class implements Action {

    async preProcessing(args: string[]) {
        const command = args[0]
        if (command) {
            switch (command) {
                case "INFO":
                    const res = await extractRecipe(args[1])
                    return {recipe: res}
            }
        }
    }

}
