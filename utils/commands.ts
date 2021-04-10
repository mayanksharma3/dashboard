import {exec as exec2} from "child_process";
import {promisify} from "util";

export const exec = promisify(exec2)

export function isNumeric(str: string) {
    if (typeof str != "string") return false // we only process strings!
    // @ts-ignore
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
