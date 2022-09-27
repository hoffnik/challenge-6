
var searchFormEl = document.querySelector("#search-form");
var searchInputEl = document.querySelector("#search-input");
var searchErrorMessageEl = document.querySelector("#search-error-message");
var searchHistoryEl = document.querySelector("#search-history");

var rightColumnEl = document.querySelector(".right-column");
var cityNameEl = document.querySelector("#city-name");
var currentDateEl = document.querySelector("#current-date");
var currentIconEl = document.querySelector("#current-weather-icon");
var currentTempEl = document.querySelector("#current-temperature");
var currentHumidityEl = document.querySelector("#current-humidity");
var currentWindSpeedEl = document.querySelector("#current-wind-speed");
var currentUvIndexValueEl = document.querySelector("#current-uv-index-value");
var forecastCardsListEl = document.querySelector("#forecast-cards-list");



var favorableWeatherConditions = [701, 721, 800, 801, 802, 803, 804];
var moderateWeatherConditions = [
  300,
  301,
  302,
  311,
  500,
  501,
  600,
  601,
  612,
  615,
  620,
  731,
  741,
];
var severeWeatherConditions = [
  200,
  201,
  202,
  210,
  211,
  212,
  221,
  230,
  231,
  232,
  312,
  313,
  314,
  321,
  502,
  503,
  504,
  511,
  520,
  521,
  522,
  531,
  602,
  611,
  613,
  616,
  621,
  622,
  711,
  751,
  761,
  762,
  771,
  781,
];

 // Using older version of openweather API before One Call API 3.0
var currentWeatherAPI =
  "https://api.openweathermap.org/data/2.5/weather?q=";
// Forecast  
var forecastAPI = "https://api.openweathermap.org/data/2.5/forecast?q=";
// UV Index 
var uvIndexAPI = "https://api.openweathermap.org/data/2.5/uvi?appid=";

// openweathermap icons
var weatherIcons = "https://openweathermap.org/img/wn/";


var openWeatherMapApiKey = "90c8dd8e9e076148c610ba00e0ae1a71";

var currentCity;


var currentLat = 0;
var currentLon = 0;

var searchListArray = [];

var convertDate = function (epochDate) {
  var day = epochDate.getDate();
  var month = epochDate.getMonth() + 1; // Adds one because month starts at 0 index
  var year = epochDate.getFullYear();

  var convertedDate = month + "/" + day + "/" + year;
  return convertedDate;
};

var resets = function () {
  // resets input for every new search
  searchInputEl.value = "";

  searchErrorMessageEl.innerHTML = "";

  
  forecastCardsListEl.innerHTML = "";
};

var searchFormHandler = function (event) {
  event.preventDefault();

  var citySearchTerm = searchInputEl.value.trim().toLowerCase();
  if (citySearchTerm) {
    getCityWeather(citySearchTerm);

  } else {
    searchErrorMessageEl.textContent = "Please enter a city name to display weather forecast";
  }
};

var searchHistoryHandler = function (event) {
  event.preventDefault();
  var citySearchTerm = event.target.textContent;
  getCityWeather(citySearchTerm);
};

// save currentCity
var saveCity = function () {
  // Add search to beginning of search history
  searchListArray.unshift(currentCity);



  // keep search list of max 8 items
  if (searchListArray.length == 9) {
    searchListArray.splice(8, 1);
  }
 
  var searchListString = JSON.stringify(searchListArray);

  window.localStorage.setItem("citySearchListLS", searchListString);

  // // reload history when saved
  loadSearchList();
};

var loadSearchList = function (citySearchList) {
  // load history from localStorage
  var loadedSearchList = window.localStorage.getItem("citySearchListLS");

  if (loadedSearchList) {
    searchHistoryEl.innerHTML = "";

    loadedSearchList = JSON.parse(loadedSearchList);

    // creates list item and appends to search history list
    for (i = 0; i < loadedSearchList.length; i++) {
      var searchHistoryItemEl = document.createElement("li");
      searchHistoryItemEl.innerHTML = loadedSearchList[i];
      searchHistoryEl.appendChild(searchHistoryItemEl);
    }

    
    searchListArray = loadedSearchList;
  }
};


loadSearchList();

var getCityWeather = function (citySearchTerm) {
  
  // calls function to reset certain values
  resets();

  // sets Current Weather Data API URL according to openweathermap.org specs
  var apiUrl = currentWeatherAPI + citySearchTerm +
    // use fahrenheit instead of kelvin
    "&units=imperial" + "&appid=" + openWeatherMapApiKey;

  // fetch API
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        currentCity = citySearchTerm;
        return response.json();
        // if unseccussfull request send error message
      } else {
        searchErrorMessageEl.innerHTML = "Error!<br />City not found.";
      }
    })
    // call fctn and write current weather from data
    .then(function (data) {
      // save lat and long of current city for UV index
      currentLat = data.coord.lat;
      currentLon = data.coord.lon;
      displayCurrentWeather(data);
    })
    // fetch data for UV index
    .then(function () {
      getCityUvIndex(currentLat, currentLon);
    })
    // fetch forecast data
    .then(function () {
      getForecastWeather(citySearchTerm);
    })
    .then(function () {
      saveCity();
    })
};

// get 5 day 3 hour forecast info
var getForecastWeather = function (citySearchTerm) {
  var apiUrl = forecastAPI + citySearchTerm + "&units=imperial" + "&appid=" + openWeatherMapApiKey;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayForecastWeather(data);
    });
};

var getCityUvIndex = function (currentLat, currentLon) {
  var apiUrl = uvIndexAPI + openWeatherMapApiKey + "&lat=" + currentLat + "&lon=" + currentLon;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayUvIndex(data);
    });
};
// Analyze weather condition to set bg color of UV index
var analyzeWeatherConditions = function (currentWeatherCondition) {
// checks if favorable
  for (var i = 0; i < favorableWeatherConditions.length; i++) {
    if (currentWeatherCondition == favorableWeatherConditions[i]) {
      currentUvIndexValueEl.style.backgroundColor = "green";
      currentUvIndexValueEl.style.color = "#ffffff";
    }
  }

  // checks if moderate
  for (var i = 0; i < moderateWeatherConditions.length; i++) {
    if (currentWeatherCondition == moderateWeatherConditions[i]) {
      currentUvIndexValueEl.style.backgroundColor = "yellow";
      currentUvIndexValueEl.style.color = "#000000";
    }
  }

  // checks if severe
  for (var i = 0; i < severeWeatherConditions.length; i++) {
    if (currentWeatherCondition == severeWeatherConditions[i]) {
      currentUvIndexValueEl.style.backgroundColor = "#dc3545"; //red color
      currentUvIndexValueEl.style.color = "#ffffff";
    }
  }
};

var displayCurrentWeather = function (data) {

  currentCityName = data.name;

  var currentEpochDate = new Date();
  var currentDate = convertDate(currentEpochDate);

  
  var currentIcon = data.weather[0].icon;
  var currentTemperature = data.main.temp;
  var currentHumidity = data.main.humidity;
  var currentWindSpeed = data.wind.speed;
  var currentWeatherCondition = data.weather[0].id;

  analyzeWeatherConditions(currentWeatherCondition);

  cityNameEl.innerHTML = currentCityName;
  currentDateEl.innerHTML = currentDate;
  currentIconEl.src = weatherIcons + currentIcon + ".png";
  currentTempEl.innerHTML = "Temperature: " + currentTemperature + " &#176;F";
  currentHumidityEl.innerHTML = "Humidity: " + currentHumidity + "%";
  currentWindSpeedEl.innerHTML = "Wind Speed: " + currentWindSpeed + " MPH";
};

var displayUvIndex = function (data) {
  // get UV Index 
  var currentUvIndex = data.value;
  // write UV Index to html element
  currentUvIndexValueEl.innerHTML = currentUvIndex;
};


var displayForecastWeather = function (data) {
  /* loop increases by 8 as every forecast is in 3 hours and we want a 24 hour forecast
      i < 40 since 40 / 8 = 5 days */
  for (var i = 7; i < 40; i += 8) {
    var forecastEpochDate = new Date(data.list[i].dt * 1000);
    var forecastIcon = data.list[i].weather[0].icon;
    var forecastTemperature = data.list[i].main.temp;
    var forecastHumidity = data.list[i].main.humidity;


    var forecastCardEl = document.createElement("li");

   
    var forecastDate = convertDate(forecastEpochDate);
 
    var forecastDateEl = document.createElement("h4");
    forecastDateEl.innerText = forecastDate;
    forecastCardEl.appendChild(forecastDateEl);

    var forecastWeatherIconEl = document.createElement("img");
    forecastWeatherIconEl.src = weatherIcons + forecastIcon + ".png";
    forecastCardEl.appendChild(forecastWeatherIconEl);

    var forecastTempEl = document.createElement("p");
    forecastTempEl.className = "forecast-temp";
    forecastTempEl.innerHTML = "Temp: " + forecastTemperature + " &#176;F";
    forecastCardEl.appendChild(forecastTempEl);

    var forecastHumidityEl = document.createElement("p");
    forecastHumidityEl.innerHTML = "Humidity: " + forecastHumidity + "%";
    forecastCardEl.appendChild(forecastHumidityEl);

 
    forecastCardsListEl.appendChild(forecastCardEl);

 
    rightColumnEl.style.display = "initial";
  }
};

searchFormEl.addEventListener("submit", searchFormHandler);

searchHistoryEl.addEventListener("click", searchHistoryHandler);
