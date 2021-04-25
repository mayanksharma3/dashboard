import express from 'express';
import exphbs from "express-handlebars";
import cors from "cors";
import {promises as fs} from 'fs';
import Action from "./utils/action";
import Handlebars from 'handlebars';
import open from "open";
import {DFunction, validateFunction} from "./utils/functions";
import Fuse from 'fuse.js';
import * as http from "http";

import bodyParser from "body-parser";
import path from "path";
import Datastore from "nedb-promises";
import {Alias} from "./functions/ALIAS/alias";

const app = express()
const server = http.createServer(app);
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(cors())

app.use("/", express.static(__dirname + "/views"))

app.engine('handlebars', exphbs.create({
    defaultLayout: 'main',
    extname: '.handlebars',
    helpers: {
        inc: function (value, options) {
            return parseInt(value) + 1;
        }
    }
}).engine);

Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

function collectFunctions(): Promise<{ command: string, metadata: any }[]> {
    return fs.readdir(__dirname + "/functions").then(async (commands) => {
        const preBuiltCommands = commands.map((command) => {
            const result = require(__dirname + "/functions/" + command + "/spec.json")
            return {command: command, metadata: result}
        })

        const baseDBPath = path.join(require("os").homedir(), ".config", "dashboard", "ALIAS", "default.db")
        const db = Datastore.create(baseDBPath)
        await db.load()
        const aliases = await db.find<Alias>({})
        aliases.forEach(alias => {
            preBuiltCommands.push({
                command: alias.alias,
                metadata: {actualCommand: alias.command, description: alias.command}
            })
        })
        return preBuiltCommands
    })
}

app.get('/open', async (req, res) => {
    await open(req.query.q as string)
    res.send("Completed")
});

app.get('/panel', (req, res) => {
    res.render('panel');
});

let functionRouter = undefined
app.use("/api", (req, res, next) => {
    functionRouter(req, res, next)
});

function findFunction(functions: DFunction[], functionName: string) {
    const options = {
        keys: ['command', 'metadata.description']
    }
    const fuse = new Fuse(functions, options)
    return fuse.search(functionName.toUpperCase())[0].item
}

app.get('/panel/:function', async (req, res) => {
    let functionInfo: DFunction = functions.find(x => x.command === req.params.function.toUpperCase())
    if (!functionInfo) {
        functionInfo = findFunction(functions, req.params.function.toLowerCase());
    }
    let functionName = functionInfo.command;
    if (functionInfo) {
        let functionParams = req.query.q;
        if (functionInfo.metadata.actualCommand) {
            let aliasArgs = functionInfo.metadata.actualCommand.split(" ");
            functionName = aliasArgs.shift()
            functionInfo = findFunction(functions, functionName)
            functionParams = aliasArgs.join(",")
            functionParams += "," + req.query.q;
        }
        const args = validateFunction(functionInfo, functionParams ? (functionParams as string).split(",") : [])
        if (args) {
            const FAction = require(`${__dirname}/functions/${functionName}/${functionName.toLowerCase()}`).default;
            const action = new FAction(functionInfo.metadata.variables || {}, functionName) as Action;
            try {
                action.addToApp(server);
                functionRouter = action.addRoutes()
                const props = await action.preProcessing(args);
                let templateName = functionName.toLowerCase()
                if (props && props["HANDLEBARS_VIEW"]) {
                    templateName = props["HANDLEBARS_VIEW"];
                }
                res.render(`${__dirname}/functions/${functionName}/${templateName}.handlebars`, props);
            } catch (e) {
                res.render(`${__dirname}/views/internalError.handlebars`, {stackTrace: e});
            }
        } else {
            res.render(`${__dirname}/views/error.handlebars`, {functionInfo: functionInfo});
        }
    }

});

export let functions: DFunction[];

export function init(callback: () => void) {
    updateFunctions().then(() => {
        server.listen(process.env.PORT || 4221, () => {
            console.log("Started Server")
            callback()
        })
    })
}

export async function updateFunctions() {
    const res = await collectFunctions()
    Handlebars.registerHelper('functionsMeta', function () {
        return JSON.stringify(res);
    });
    functions = res;
}
