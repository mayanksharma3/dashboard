import Action from "../../utils/action";
import axios, {AxiosRequestConfig} from "axios";
import FormData from "form-data";
import * as fs from "fs";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        if (args.id === "uploadFilePath") {
            const data = new FormData();
            data.append('file', fs.createReadStream(args.variables["FILEPATH"]));
            const config: AxiosRequestConfig = {
                method: 'post',
                url: 'https://file.io',
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };
            const response = await axios(config)
            return {result: true, link: response.data.link}
        } else {
            return {upload: true}
        }

        // return {short_url: response.data["result_url"]}
    }

}
