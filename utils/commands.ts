import {exec as exec2} from "child_process";
import {promisify} from "util";

export const exec = promisify(exec2)
