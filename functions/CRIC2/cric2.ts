import Action from "../../utils/action";
import axios from "axios";

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        switch (args.id) {
            case "default":
            case "seriesFilter":
                const matchesResult = await axios.get("https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?latest=true")
                let matches = matchesResult.data.matches
                if (args.id === "seriesFilter") {
                    matches = matches.filter(match => match.series.name === args.variables["SERIES"])
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
            case "scorecard":
                const cricketResult = await axios.get(`https://hs-consumer-api.espncricinfo.com/v1/pages/match/scorecard?lang=en&seriesId=${args.variables["SERIES_ID"]}&matchId=${args.variables["MATCH_ID"]}`)
                // const cricketResult = await axios.get("https://hs-consumer-api.espncricinfo.com/v1/pages/match/scorecard?lang=en&seriesId=1249214&matchId=1254059")
                return {currentMatch: cricketResult.data.match, content: cricketResult.data.content}
        }
    }
}
