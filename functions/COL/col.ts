import Action from "../../utils/action";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default": {
                return {color: "rgb(242, 165, 71)"}
            }
            case "chooseColor": {
                let query = args.variables["COLOR"]
                if (query.length === 6) {
                    query = "#" + query
                }
                return {color: query}
            }
        }
    }

}
