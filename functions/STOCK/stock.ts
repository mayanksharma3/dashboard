import Action from "../../utils/action";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        return {stock: args.variables["STOCK"], exchange: args.variables["EXCHANGE"]}
    }

}
