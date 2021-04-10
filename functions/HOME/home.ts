import Action from "../../utils/action";
import open from "open";
import {exec} from "../../utils/commands";
import {functions} from "../../main";

export default class implements Action {

    async preProcessing() {
        return {functions: functions}
    }

}
