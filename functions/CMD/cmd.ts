import Action from "../../utils/action";
import {exec} from "../../utils/commands";

export default class implements Action {

    async preProcessing() {
        await exec('open -a terminal $HOME')
        return {message: "Opened in new window"}
    }

}
