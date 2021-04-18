import Action from "../../utils/action";
import {Router} from 'express';

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default": {
                return {HANDLEBARS_VIEW: "stock"}
            }
            case "overview": {
                return {HANDLEBARS_VIEW: "overview"}
            }
        }
        // return {stock: args.variables["STOCK"], exchange: args.variables["EXCHANGE"]}
    }

    addRoutes() {
        const router = Router();
        router.get("/", (req, res) => {
            console.log("HERE")
        });
        return router;
    }

}
