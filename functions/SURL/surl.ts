import Action from "../../utils/action";
import axios, {AxiosRequestConfig} from "axios";
import FormData from "form-data";
import normalizeUrl from "normalize-url";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        const data = new FormData();
        let normalizedURL = normalizeUrl(args.variables["URL"]);
        data.append('url', normalizedURL);
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: 'https://cleanuri.com/api/v1/shorten',
            headers: data.getHeaders(),
            data: data
        };
        const response = await axios(config)
        return {short_url: response.data["result_url"], url: normalizedURL.toLowerCase()}
    }

}
