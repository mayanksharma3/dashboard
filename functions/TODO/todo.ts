import Action from "../../utils/action";
import Datastore from "nedb-promises";
import {v4 as uuidv4} from 'uuid';
import {promises as fs} from 'fs';
import path from "path";

interface TodoItem {
    title: string;
    completed: boolean;
}

export default class extends Action {

    baseDBPath = path.join(require("os").homedir(), ".config", "dashboard", "TODO")

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default":
                const lists = await fs.readdir(this.baseDBPath)
                const result = {
                    overview: true,
                    lists: []
                }
                for (const list1 of lists.filter(list => list.endsWith(".db"))) {
                    const db = Datastore.create(path.join(this.baseDBPath, list1.toUpperCase()));
                    await db.load()
                    const findResult = await db.find<TodoItem>({completed: false})
                    result.lists.push({name: list1.toUpperCase().split(".DB")[0], items: findResult})
                }
                return result
            case "addItem": {
                let db = Datastore.create(path.join(this.baseDBPath, args.variables["LIST"].toUpperCase() + ".db"));
                await db.load()
                await db.insert({
                    id: uuidv4(),
                    title: args.variables["ITEM"].toUpperCase(),
                    completed: false
                })
                const result = await db.find<TodoItem>({completed: false})
                return {listTitle: args.variables["LIST"].toUpperCase(), items: result}
            }
            case "completeItem": {
                let db = Datastore.create(path.join(this.baseDBPath, args.variables["LIST"].toUpperCase() + ".db"));
                await db.load()
                await db.update({id: args.variables["ID"]}, {$set: {completed: true}})
                const result = await db.find<TodoItem>({completed: false})
                return {listTitle: args.variables["LIST"].toUpperCase(), items: result}
            }
            case "viewList": {
                const db = Datastore.create(path.join(this.baseDBPath, args.variables["LIST"].toUpperCase() + ".db"));
                await db.load()
                const result = await db.find<TodoItem>({completed: false})
                return {listTitle: args.variables["LIST"].toUpperCase(), items: result}
            }

        }

    }

}
