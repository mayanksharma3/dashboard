import {IPty, spawn} from "node-pty";
import os from "os";

class PTY {
    private readonly shell: string;
    private ptyProcess: IPty | undefined = undefined;
    private socket: any;

    constructor(socket) {
        this.shell = os.platform() === "win32" ? "cmd.exe" : "zsh";
        this.ptyProcess = null;
        this.socket = socket;

        this.startPtyProcess();
    }

    startPtyProcess() {
        this.ptyProcess = spawn(this.shell, [], {
            name: "xterm-color",
            cwd: process.env.HOME, // Which path should terminal start
            env: process.env // Pass environment variables
        });

        this.ptyProcess.on("data", data => {
            this.sendToClient(data);
        });
    }

    write(data) {
        this.ptyProcess.write(data);
    }

    sendToClient(data) {
        this.socket.emit("output", data);
    }
}

export default PTY;
