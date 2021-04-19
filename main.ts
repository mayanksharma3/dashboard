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

const app = express()
const server = http.createServer(app);
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
    return fs.readdir(__dirname + "/functions").then((commands) => {
        return commands.map((command) => {
            const result = require(__dirname + "/functions/" + command + "/spec.json")
            return {command: command, metadata: result}
        })
    })
}

app.get('/open', async (req, res) => {
    await open(req.query.q as string)
});

app.get('/panel', (req, res) => {
    res.render('panel');
});

let functionRouter = undefined
app.use("/api", (req, res, next) => {
    functionRouter(req, res, next)
});

app.get('/panel/:function', async (req, res) => {
    let functionInfo: DFunction = functions.find(x => x.command === req.params.function.toUpperCase())
    if (!functionInfo) {
        const options = {
            keys: ['command', 'metadata.description']
        }
        const fuse = new Fuse(functions, options)
        functionInfo = fuse.search(req.params.function.toUpperCase())[0].item
    }
    let functionName = functionInfo.command;
    if (functionInfo) {
        const args = validateFunction(functionInfo, req.query.q ? (req.query.q as string).split(",") : [])
        if (args) {
            const FAction = require(`${__dirname}/functions/${functionName}/${functionName.toLowerCase()}`).default;
            const action = new FAction(functionInfo.metadata.variables || {}) as Action;
            try {
                action.addToApp(server);
                functionRouter = action.addRoutes()
                const props = await action.preProcessing(args);
                let templateName = functionName.toLowerCase()
                if (props && props["HANDLEBARS_VIEW"]) {
                    templateName = props["HANDLEBARS_VIEW"];
                }
                const template = await fs.readFile(`${__dirname}/functions/${functionName}/${templateName}.handlebars`)
                const compiledTemplate = Handlebars.compile(template.toString())
                res.render("panel", {panelBody: compiledTemplate(props), props: props});
            } catch (e) {
                const template = await fs.readFile(`${__dirname}/views/internalError.handlebars`)
                const compiledTemplate = Handlebars.compile(template.toString())
                res.render("panel", {panelBody: compiledTemplate({stackTrace: e})});
            }
        } else {
            const template = await fs.readFile(`${__dirname}/views/error.handlebars`)
            const compiledTemplate = Handlebars.compile(template.toString())
            res.render("panel", {panelBody: compiledTemplate({functionInfo: functionInfo})});
        }
    }

});

export let functions: DFunction[];

collectFunctions().then((res) => {
    Handlebars.registerHelper('functionsMeta', function () {
        return JSON.stringify(res);
    });
    functions = res;
    server.listen(process.env.PORT || 4221, () => {
        console.log("Started Server")
    })
})
