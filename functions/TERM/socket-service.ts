// Manage Socket.IO server
import SocketIO, {Server} from "socket.io";
import PTY from "./pty-service";

class SocketService {
    private socket: SocketIO.Socket | undefined = undefined;
    private pty: PTY;
    constructor() {
        this.socket = null;
        this.pty = null;
    }

    attachServer(server) {
        if (!server) {
            throw new Error("Server not found...");
        }
        const io = new Server(server);
        io.on("connection", socket => {
            this.socket = socket;
            this.pty = new PTY(this.socket);
            this.socket.on("input", input => {
                this.pty.write(input);
            });
        });
    }
}

export default SocketService;
