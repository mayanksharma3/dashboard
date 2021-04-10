import Action from "../../utils/action";
import axios from "axios";
import {isNumeric} from "../../utils/commands";

export default class implements Action {

    async preProcessing(args: string[]) {
        if (args.length === 2 && args.every(x => !isNaN(parseInt(x)))) {
            // const cricketResult = await axios.get(`https://hs-consumer-api.espncricinfo.com/v1/pages/match/scorecard?lang=en&seriesId=${args[0]}&matchId=${args[1]}`)
            const cricketResult = await axios.get("https://hs-consumer-api.espncricinfo.com/v1/pages/match/scorecard?lang=en&seriesId=1249214&matchId=1254059")
            console.log(cricketResult.data.match)
            return {currentMatch: cricketResult.data.match}
        }
        const cricketResult = await axios.get("https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?latest=true")
        let matches = cricketResult.data.matches
        if (args.length > 0) {
            if(!isNumeric(args[0])) {
                matches = matches.filter(match => match.series.name === "IPL")
            }
        }
        const scores = matches.map((match: any) => {
            return {
                id: match.objectId,
                status: match.statusText,
                seriesId: match.series.objectId,
                seriesName: match.series.name,
                team1: match.teams[0].team.name,
                team2: match.teams[1].team.name,
            }
        })
        return {scores: scores}
    }

}
