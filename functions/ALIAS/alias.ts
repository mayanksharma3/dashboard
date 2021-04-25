import Action from "../../utils/action";
import {functions, updateFunctions} from "../../main";

export interface Alias {
    alias: string;
    command: string;
}

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default": {
                const db = await this.dbInstance()
                const aliases = await db.find<Alias>({})
                return {aliases: aliases}
            }
            case "addAlias": {
                const db = await this.dbInstance()
                const aliasBody = {
                    alias: args.variables["ALIAS"].toUpperCase(),
                    command: args.variables["CMD"]
                };

                const existingFunction = functions.find(x => x.command === aliasBody.alias)
                if (!existingFunction) {
                    await db.insert<Alias>(aliasBody)
                }
                const aliases = await db.find<Alias>({})
                await updateFunctions()
                return {aliases: aliases}
            }
            case "deleteAlias": {
                const db = await this.dbInstance()
                await db.ensureIndex({fieldName: 'alias', unique: true})
                await db.remove({alias: args.variables["ALIAS"].toUpperCase()}, {})
                const aliases = await db.find<Alias>({})
                await updateFunctions()
                return {aliases: aliases}
            }
        }
    }

}
