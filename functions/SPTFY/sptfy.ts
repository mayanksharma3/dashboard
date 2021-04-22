import Action from "../../utils/action";
import spotify from "spotify-node-applescript";
import * as util from "util";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {

        const isRunning = await this.isRunning()

        if (!isRunning) {
            return {HANDLEBARS_VIEW: "no_spotify"}
        }

        switch (args.id) {
            case "nextTrack": {
                await util.promisify(spotify.next)()
                break;
            }
            case "previousTrack": {
                await util.promisify(spotify.previous)()
                break;
            }
            case "pauseTrack": {
                await util.promisify(spotify.pause)()
                break;
            }
            case "playTrack": {
                await util.promisify(spotify.play)()
                break;
            }
        }
        const track = await this.getTrack()
        const currentState = await util.promisify(spotify.getState)()
        return {track: track, playing: currentState.state === "playing" ? "pause" : "play"}
    }

    async getTrack() {
        return await util.promisify(spotify.getTrack)()
    }

    async isRunning() {
        return await util.promisify(spotify.isRunning)()
    }

}
