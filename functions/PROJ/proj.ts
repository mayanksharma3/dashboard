import Action from "../../utils/action";
import GitUrlParse from "git-url-parse";
import origin from "remote-origin-url";
import {Router} from "express";
import {exec} from "../../utils/functions";
import * as path from "path";
import Datastore from "nedb-promises";
import open from "open";

const {dialog} = require('electron')
const {Octokit} = require("@octokit/core");

interface Project {
    id: string;
    projectName: string;
    localPath: string;
    description: string;
    preferredIDE: "vscode" | "webstorm" | "idea" | "clion" | "pycharm";
}

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        const db = await this.dbInstance()
        await db.ensureIndex({fieldName: 'id', unique: true})
        switch (args.id) {
            case "default": {
                return await this.findProjects(db);
            }
            case "addProject": {
                return {
                    HANDLEBARS_VIEW: "add_project"
                }
            }
            case "projectTerminal": {
                const db = await this.dbInstance();
                const project = await db.findOne<Project>({id: args.variables["ID"].toLowerCase()})
                await this.openInTerminal(project.localPath)
                return await this.findProjects(db)
            }
            case "projectIDE": {
                const db = await this.dbInstance();
                const project = await db.findOne<Project>({id: args.variables["ID"].toLowerCase()})
                await this.openInIDE(project.preferredIDE, project.id);
                return await this.findProjects(db)
            }
            case "projectFolder": {
                const db = await this.dbInstance();
                const project = await db.findOne<Project>({id: args.variables["ID"].toLowerCase()})
                await open(project.localPath);
                return await this.findProjects(db)
            }
        }
    }

    private async findProjects(db: Datastore) {
        const projects = await db.find<Project>({})
        const projectsResult = []
        for (let i = 0; i < projects.length; i++) {
            let currentProject = projects[i];
            let pwd = currentProject.localPath;
            let url = await origin(path.join(pwd, ".git", "config"));
            const gitParsedURL = GitUrlParse(url);
            let ideImage = ''
            if (currentProject.preferredIDE !== "vscode") {
                ideImage = `https://blog.jetbrains.com/wp-content/uploads/2019/01/${currentProject.preferredIDE}_icon.svg`
            } else {
                ideImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/1200px-Visual_Studio_Code_1.35_icon.svg.png'
            }
            projectsResult.push({
                localPath: pwd,
                repoURL: gitParsedURL.resource + gitParsedURL.pathname,
                projectName: currentProject.projectName,
                description: currentProject.description,
                domain: gitParsedURL.resource,
                ideImage: ideImage,
                ide: currentProject.preferredIDE,
                id: currentProject.id,
                invertImage: gitParsedURL.resource === "github.com"
            });
        }
        return {projects: projectsResult}
    }

    addRoutes(): Router {
        const router = Router()

        router.get("/terminal", async (req, res) => {
            await this.openInTerminal(req.query.q as string);
            res.send("Open Terminal")
        })

        router.get("/ide", async (req, res) => {
            await this.openInIDE(req.query.ide as string, req.query.id as string);
            res.send("Open IDE")
        })

        router.post('/add', async (req, res) => {
            const db = await this.dbInstance()
            const project = req.body as Project;
            project.id = project.id.toLowerCase()
            db.insert(project).then(() => {
                res.send("Added")
            }).catch(() => {
                res.status(400).send("Not Added")
            })
        });

        router.post('/delete', async (req, res) => {
            const db = await this.dbInstance()
            const projectID = (req.body.id as string).toLowerCase();
            db.remove({id: projectID}, {}).then(() => {
                res.send("Added")
            }).catch(() => {
                res.status(400).send("Not Added")
            })
        });

        router.get('/dialog', async (req, res) => {
            const folderPath = await dialog.showOpenDialog({properties: ['openDirectory']})
            if (!folderPath.cancelled) {
                origin(path.join(folderPath.filePaths[0], ".git", "config")).then(async (url) => {
                    const gitParsedURL = GitUrlParse(url);
                    let description = undefined;
                    if (gitParsedURL.resource === "github.com") {
                        try {
                            const response = await new Octokit().request('GET /repos/{owner}/{repo}', {
                                owner: gitParsedURL.owner,
                                repo: gitParsedURL.name
                            })
                            description = response.data.description;
                        } catch (e) {
                        }
                    }
                    res.send({
                        "folderPath": folderPath.filePaths[0],
                        "projectName": path.basename(folderPath.filePaths[0]),
                        "description": description
                    });
                }).catch(() => {
                    res.send({});
                });
            } else {
                res.send({});
            }
        });
        return router;
    }

    private async openInIDE(ide: string, id: string) {
        const ideToApp = {
            "vscode": "com.microsoft.vscode",
            "idea": "com.jetbrains.intellij",
            "webstorm": "com.jetbrains.webstorm",
            "clion": "com.jetbrains.clion",
            "pycharm": "com.jetbrains.pycharm"
        }
        const chosenIde = ide as string;
        const db = await this.dbInstance()
        const project = await db.findOne<Project>({id: id as string})
        await exec(`open -b '${ideToApp[chosenIde]}'  ${project.localPath}`)
    }

    private async openInTerminal(path: string) {
        await exec("open -a terminal " + path)
    }
}
