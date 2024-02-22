import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_SunriseSunset_URL = "https://api.sunrise-sunset.org/json?";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.post("/view", async (req, res) => {
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const currentDate = new Date().toDateString();

  const geoMapsKey = "65d5405beebac881369558hsj464cd2";
  const API_geoMaps_URL = "https://geocode.maps.co/search?city="+city+"&country="+country+"&state="+state+"&api_key="+geoMapsKey;

  let lat, lon;
  
  //Retrieve latitude and longitude from city input
  async function fetchDataGeoMaps() {
    try {
      const response = await fetch(API_geoMaps_URL);
      const data = await response.json();
      lat = "lat=" + data[0].lat;
      lon = "lng=" + data[0].lon;
      // console.log(data);
      // console.log(API_SunriseSunset_URL + lat + "&" + lon);
      return { lat, lon };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //Retrieve time zone
  async function fetchDataTimezoneDB() {
    try {
      const response = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=IHT6M5112BMV&format=json&by=position&${lat}&${lon}`);
      const data = await response.json();
      // console.log(data);
      const zoneName = data.zoneName;
      // console.log(zoneName);
      return { zoneName };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  try {
    const { lat, lon } = await fetchDataGeoMaps();
    const { zoneName } = await fetchDataTimezoneDB();
    const result = await axios.get(API_SunriseSunset_URL + lat + "&" + lon + "&tzid=" + zoneName);
    res.render("index.ejs", { 
      content: JSON.stringify(result.data.results),
      sunrise: JSON.stringify(result.data.results.sunrise),
      sunset: JSON.stringify(result.data.results.sunset),
      solarNoon: JSON.stringify(result.data.results.solar_noon),
      dayLength: JSON.stringify(result.data.results.day_length),
      civilTwilightBegin: JSON.stringify(result.data.results.civil_twilight_begin),
      civilTwilightEnd: JSON.stringify(result.data.results.civil_twilight_end),
      city: city,
      state: state,
      country: country,
      zoneName: zoneName,
      date: currentDate,
    });
  } catch (error) {
    console.log(error.response);
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: "Data not found",
    });
  }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });