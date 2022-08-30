$(document).ready(function () {
    var currentDate = moment().format("LL");
    var apiKey = "f61c25ccc3ebc66abfbc574449b8e000";
    var searchedCity;
    cities = localStorage.getItem("cities");
    citiesObj = JSON.parse(cities);
    if(!$.isEmptyObject(citiesObj)) {
    searchedCity = citiesObj[0];
    cityWeather(searchedCity);
    $.each( citiesObj, function( key, value ) {
      $("#city-list").append(
        `<li class="list-group-item text-center city-list btn" id="${value}">${value}</li>`
      );
    });
    }
  
    $('.city-list').click(function() {
      searchedCity = $(this).attr('id');
      cityWeather(searchedCity);
    });
    $('.btn-clear').click(function() {
      $("#city-list").empty();
      $("#current-city").addClass("invisible");
      localStorage.clear();
      citiesObj = null;
      cities = null;
    });
  
  
    $("#btn-citySearch").click(function () {
      searchedCity = $("#citySearch-inp").val().trim();
      cityWeather(searchedCity);
      $("#citySearch-inp").val("")
      event.preventDefault();
    });
    function cityWeather(searchedCity) {
        latitude = '';
        longitude = '';
        const todayUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${apiKey}`;
        $.ajax({
          url: todayUrl,
          dataType: "json",
          success: function(response) {
            latitude = response.coord.lat;
            longitude = response.coord.lon;

            const cityName = response.name + ` : ` + response.sys.country;
            const tempF = ((response.main.temp - 273.15) * 1.8 + 32).toFixed();
            const humidity = response.main.humidity;
            const windSpeed = response.wind.speed;
            const icon = response.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${icon}.png`;
            $("#current-city").removeClass("invisible");
            $("#current-city").addClass("visible");
            if(jQuery.inArray(response.name, citiesObj) == -1) {
              cities = localStorage.getItem("cities");
              citiesObj = cities ? JSON.parse(cities) : [];
              // console.log(response.name);
              $("#city-list").append(
                `<li class="list-group-item text-center city-list btn" id="${response.name}">${response.name}</li>`
                );
              citiesObj.push(response.name);
              localStorage.setItem("cities", JSON.stringify(citiesObj));
              }
  
            $(".btn-clear").click(function () {
                $("#cityItem").empty(); 
            });
            $("#current-date").text(currentDate + " ");
            $("#currentCity").text(cityName + ",  ");
            $("#img").attr("src", iconUrl);
            $("#temperature").text("temperature:  " + tempF + "  °F");
            $("#humidity").text("humidity:  " + humidity + "  %");
            $("#windspeed").text("windspeed:  " + windSpeed + "  MPH");
            let uvUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&latitude=${latitude}&longitude=${longitude}`;
            $.ajax({
              url: uvUrl,
              dataType: "json",
              success: function(response) {
                let uvVal = response.value;
                $("#uv").text("UV index:  " + uvVal);
                let i = uvVal;
                if (i < 3) {
                  $("#uv").addClass("green");
                } else if (i < 6) {
                  $("#uv").addClass("yellow");
                } else if (i < 8) {
                  $("#uv").addClass("orange");
                } else if (i < 11) {
                  $("#uv").addClass("red");
                } else {
                  $("#uv").addClass("purple");
                }
              },
              error: function(data) {
                console.log(data);
                result = JSON.parse(data.responseText);
                alert(result.message);
              },
            });
            let fiveUrl = `https://api.openweathermap.org/data/2.5/onecall?latitude=${latitude}&longitude=${longitude}&exclude=current,minutely,hourly&appid=${apiKey}`;
            $.ajax({
              url: fiveUrl,
              dataType: "json",
              success: function(response) {
                $(".each-day").each(function (index) {
                  let Resdata = response.daily[index + 1];
                  let dateElem = Resdata.dt;
                  let day = moment.unix(dateElem).format("l");
                  let icon = Resdata.weather[0].icon;
                  let iconUrl = `http://openweathermap.org/img/wn/${icon}.png`;
                  let temp = ((Resdata.temp.day - 273.15) * 1.8 + 32).toFixed();
                  let humidity = Resdata.humidity;
                  $(this).empty();
                  let newFiveDays = $(this).append(
                    `<p class = col-6 >${day}</p><img src="${iconUrl}"><p class = col-6 >Temperature:  ${temp}  °F </p><p class = col-6 >Humidity:  ${humidity}  % </p>`
                  );
              });
              },
              error: function(data) {
                console.log(data);
                result = JSON.parse(data.responseText);
                alert(result.message);
              },
            });
          },
          error: function(data) {
            console.log(data);
            result = JSON.parse(data.responseText);
            alert(result.message);
          },
      });
    }
  });