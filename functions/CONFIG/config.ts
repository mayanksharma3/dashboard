import Action from "../../utils/action";
import {exec} from "../../utils/commands";

export default class implements Action {

    async preProcessing() {
        await exec('open -a terminal ' + __dirname)
        return {message: "Opened config"}
    }

}
