import Action from "../../utils/action";
import {exec} from "../../utils/functions";

export default class extends Action {

    async preProcessing() {
        await exec('open -a terminal $HOME')
        return {message: "Opened in new window"}
    }

}
