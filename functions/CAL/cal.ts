import Action from "../../utils/action";
import axios from "axios";

var ical2json = require("ical2json");

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        const fsResult = await axios.get(this.configVariables.calendarLink)
        const output = ical2json.convert(fsResult.data);
        return {
            events: JSON.stringify(
                output.VCALENDAR[0].VEVENT.map(event => {
                    return {title: event.SUMMARY, start: event.DTSTART, end: event.DTEND, description: event.DESCRIPTION}
                })
            )
        }

    }

}
