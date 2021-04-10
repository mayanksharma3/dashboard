import Action from "../../utils/action";
import axios from "axios";

export default class implements Action {

    async preProcessing(args: string[]) {
        const location = args.length > 0 ? args[0] : "Hazlemere";
        const res = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=712d937fbad3bca221f1a0649abff2c0&units=metric`)
        const temp = Math.round(res.data.main.temp) + '°C'
        const tempMin = Math.round(res.data.main.temp_min) + '°C'
        const tempMax = Math.round(res.data.main.temp_max) + '°C'
        const weatherImg = 'http://openweathermap.org/img/wn/' + res.data.weather[0].icon + '.png'
        const imgLarge = 'http://openweathermap.org/img/wn/' + res.data.weather[0].icon + '@4x.png'
        return {
            location: location,
            temperature: tempMin,
            tempMin: temp,
            tempMax: tempMax,
            image: weatherImg,
            imageLg: imgLarge,
            description: res.data.weather[0].description
        }
    }

}
