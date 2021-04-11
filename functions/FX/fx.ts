import Action from "../../utils/action";
import axios from "axios";

export default class extends Action {

    async preProcessing(args: { id: string, variables: {[key: string]: string }}) {
        const fsResult = await axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${args.variables["FROM"]}&to_currency=${args.variables["TO"]}&apikey=UUJH7C28CFKAR8ZC`)
        return {
            from: args.variables["FROM"],
            to: args.variables['TO'],
            amountFrom: args.variables["AMOUNT"],
            amountTo: (parseFloat(fsResult.data['Realtime Currency Exchange Rate']["5. Exchange Rate"]) * parseFloat(args.variables["AMOUNT"]))
        }
    }

}
