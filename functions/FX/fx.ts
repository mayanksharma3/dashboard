import Action from "../../utils/action";
import axios from "axios";

export default class implements Action {

    async preProcessing(args: string[]) {
        const fsResult = await axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${args[0]}&to_currency=${args[1]}&apikey=UUJH7C28CFKAR8ZC`)
        return {from: args[0], to: args[1], amountFrom: args[2], amountTo: (parseFloat(fsResult.data['Realtime Currency Exchange Rate']["5. Exchange Rate"]) * parseFloat(args[2]))}
    }

}
