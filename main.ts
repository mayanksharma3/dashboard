import express from 'express';
import exphbs from "express-handlebars";
import cors from "cors";
import {promises as fs} from 'fs';
import Action from "./utils/action";
import Handlebars from 'handlebars';
import open from "open";
import {DFunction, validateFunction} from "./utils/commands";

const app = express()

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
    await open(req.query.q)
});

app.get('/panel', (req, res) => {
    res.render('panel');
});

app.get('/panel/:function', async (req, res) => {
    let functionInfo: DFunction = functions.find(x => x.command === req.params.function.toUpperCase())
    if (!functionInfo) {
        functionInfo = functions.find(x => x.command === req.query.fuzzy.toUpperCase())
    }
    let functionName = functionInfo.command;
    if (functionInfo) {
        const args = validateFunction(functionInfo, req.query.q ? req.query.q.split(",") : [])
        if(args) {
            const test = require(`${__dirname}/functions/${functionName}/${functionName.toLowerCase()}`).default;
            const testInstance = new test(functionInfo.metadata.variables || {}) as Action;
            const props = await testInstance.preProcessing(args);
            const template = await fs.readFile(`${__dirname}/functions/${functionName}/${functionName.toLowerCase()}.handlebars`)
            const compiledTemplate = Handlebars.compile(template.toString())
            res.render("panel", {panelBody: compiledTemplate(props)});
        } else {
            const template = await fs.readFile(`${__dirname}/views/error.handlebars`)
            const compiledTemplate = Handlebars.compile(template.toString())
            res.render("panel", {panelBody: compiledTemplate({})});
        }
    }

});

export let functions: DFunction[];

collectFunctions().then((res) => {
    Handlebars.registerHelper('functionsMeta', function () {
        return JSON.stringify(res);
    });
    functions = res;
    app.listen(process.env.PORT || 4221, () => {
        console.log("Started Server")
    })
})


