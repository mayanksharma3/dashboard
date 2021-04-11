import Action from "../../utils/action";
import {functions} from "../../main";

export default class extends Action {

    async preProcessing() {
        return {functions: functions.sort((x, y) => x.command.localeCompare(y.command))}
    }

}
