import path from "path";
import Datastore from "nedb-promises";
import {Express, Router} from "express";
import {Server} from "http";

abstract class Action {

    configVariables: { [key: string]: string }
    name: string;

    protected constructor(configVariables: { [key: string]: string }, name: string) {
        this.configVariables = configVariables;
        this.name = name;
    }

    abstract preProcessing(args: { id: string, variables: { [key: string]: string } });

    addRoutes(): Router | undefined {
        return undefined;
    };

    addToApp(app: Server) {

    }

    async dbInstance(dbName: string = "default"): Promise<Datastore> {
        const baseDBPath = path.join(require("os").homedir(), ".config", "dashboard", this.name, `${dbName}.db`)
        const db =  Datastore.create(baseDBPath)
        await db.load()
        return db
    }

}

export default Action;
