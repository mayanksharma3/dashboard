import Action from "../../utils/action";
import SocketService from "./socket-service";
import {Server} from "http";

export default class extends Action {

    async preProcessing() {
        // await exec('open -a terminal $HOME')
        return {message: "Opened in new window"}
    }

    addToApp(app: Server) {
        const socketService = new SocketService();
        socketService.attachServer(app);
    }
}
