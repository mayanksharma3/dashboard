import Action from "../../utils/action";
import axios from "axios";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default class extends Action {

    async preProcessing(args: { id: string, variables: { [key: string]: string } }) {
        const location = args.id === "locationSearch" ? args.variables["LOCATION"] : this.configVariables.defaultLocation;
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=${this.configVariables.API_KEY}&units=metric`)
        const res2 = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${res.data.coord.lat}&units=metric&lon=${res.data.coord.lon}&appid=${this.configVariables.API_KEY}&exclude=current,minutely,hourly,alerts`)
        const temp = Math.round(res.data.main.temp) + '°C'
        const tempMin = Math.round(res.data.main.temp_min) + '°C'
        const tempMax = Math.round(res.data.main.temp_max) + '°C'
        const weatherImg = 'https://openweathermap.org/img/wn/' + res.data.weather[0].icon + '.png'
        const imgLarge = 'https://openweathermap.org/img/wn/' + res.data.weather[0].icon + '@4x.png'
        return {
            location: location,
            temperature: temp,
            tempMin: tempMin,
            tempMax: tempMax,
            image: weatherImg,
            imageLg: imgLarge,
            description: res.data.weather[0].description,
            daily: res2.data.daily.map(dailyData => {
                let d = new Date(dailyData.dt * 1000);
                return {
                    day: days[d.getDay()],
                    icon: dailyData.weather[0].icon,
                    min: Math.round(dailyData.temp.min),
                    max: Math.round(dailyData.temp.max),
                    description: dailyData.weather[0].description
                }
            })
        }
    }

}
