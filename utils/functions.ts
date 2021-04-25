import {exec as exec2} from "child_process";
import {promisify} from "util";
import Handlebars from 'handlebars';
import {promises as fs} from "fs";

export const exec = promisify(exec2)

export interface DFunction {
    command: string,
    metadata: {
        actualCommand?: string;
        variables?: {[key: string]: string}
        description: string;
        commands?: { id: string, syntax: string, description: string }[]
    }
}

export interface FunctionVariables {
    id: string,
    variables: { [key: string]: string }
}

export function collectFunctions(): Promise<{ command: string, metadata: any }[]> {
    return fs.readdir(__dirname + "/functions").then((commands) => {
        return commands.map((command) => {
            const result = require(__dirname + "/functions/" + command + "/spec.json")
            return {command: command, metadata: result}
        })
    })
}

export function validateFunction(dFunction: DFunction, args: string[]): FunctionVariables | undefined {
    args = args.map(x => x.toUpperCase())
    let commands = dFunction.metadata.commands;
    if (args.length > 0 && !commands) {
        return undefined;
    }

    if (commands) {
        if (args.length === 0) {
            return commands.find(x => x.syntax === "*") ? {
                id: commands.find(x => x.syntax === "*").id,
                variables: {}
            } : undefined;
        }

        for (let i = 0; i < commands.length; i++) {
            const commandSeparated = commands[i].syntax.split(" ")
            if (commandSeparated.length !== args.length && !isMultiVariable(commandSeparated[commandSeparated.length - 1])) {
                continue;
            }
            let matching = true;
            let variablesMap = {}
            for (let j = 0; j < args.length; j++) {
                let currCommand = commandSeparated[j];
                let currArg = args[j];
                if (isLiteral(currCommand) && currArg !== currCommand) {
                    matching = false;
                    break;
                }
                if (isMultiVariable(currCommand)) {
                    variablesMap[currCommand.replace("{{", "").replace("}}*", "")] = args.slice(j, args.length).join(" ");
                    break;
                }
                if (isVariable(currCommand)) {
                    variablesMap[currCommand.replace("{{", "").replace("}}", "")] = args[j]
                }
            }

            if (!matching) {
                continue;
            }

            const result = Handlebars.compile(commands[i].syntax.replace('*', ""))(variablesMap)
            if (result === args.join(" ")) {
                return {id: commands[i].id, variables: variablesMap}
            }
        }
        return undefined;
    }

    return {id: "default", variables: {}};
}

const isLiteral = (arg: string) => !isVariable(arg) && !isMultiVariable(arg)
const isVariable = (arg: string) => arg.startsWith("{{") && arg.endsWith("}}")
const isMultiVariable = (arg: string) => arg.startsWith("{{") && arg.endsWith("}}*")
