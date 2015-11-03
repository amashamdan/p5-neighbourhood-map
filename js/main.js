/** A global variable which holds the information of markers and infoWindows */
var markersAndInfoWindows = [];

/** A global variable which stores the location of the current city on the map */
var baseLocation;

/** A global varialbe used during initializing the map (with no saved data) */
var populationCounter = 0;

/** A global array which holds all the results of a "search places" call.
It is needed for the process of filtering the search results. */
var tempArray = [];

/** A global array which holds the postions of the places search results. */
var positionArray = [];

/** 
  * A global array with 10 default places in Seattle 
  * @default 
  */
var initialLocations = ["Seattle Aquarium", "Harborview Medical Center",
						"Sky View Observatory", "Washington State Convention Center",
						"Space Needle", "Cinerama", "Cal Anderson Park Fountain",
						"Seattle Center", "Westlake Center", "Pike Place Fish Market"];

/**
  * The function which initializes the map upon receiving response from google maps API.
  *@function
  */
function initMap() {
	/** The variable bounds is used to hold the bounds of the map. */
	window.bounds = new google.maps.LatLngBounds();
	/** This variable is used to search for new cities. */
	window.geocoder = new google.maps.Geocoder();
	/** This statement sets the baseLocation to a fedault value if no 
	stored data are found */
	if (!localStorage.searchResults) {
		/**
		* The default base location is set to Seattle
		*@default
		*/
		baseLocation = {lat: 47.605881, lng: -122.332047};
	}
	/** The map object is created and its properties are defined */
  	window.map = new google.maps.Map(document.getElementById('map'), {
	    center: baseLocation,
	    zoom: 14,
	    mapTypeId: google.maps.MapTypeId.HYBRID,
	    scaleControl: true,
	    rotateControl: true,
	    mapTypeControl: true,
	    mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
		}
  	});
  	/** The service variable is used to search for places in a given city. */
	window.service = new google.maps.places.PlacesService(map);
	/** The default bounds are set to Seattle. */
  	var defaultBounds = new google.maps.LatLngBounds(
	new google.maps.LatLng(47.55, -122.38),
	new google.maps.LatLng(47.65, -122.28));
  	/** This varialbe refers to the DOM element with the places search input field */
	var input = document.getElementById('search-input');
	/** This varialbe refers to the DOM element with the city search input field */
	var cityInput = document.getElementById('city');
	/** SearchBox service for places search predictions. */
	window.searchBox = new google.maps.places.SearchBox(input, {
	  bounds: defaultBounds
	});
	/** SearchBox service for cities search predictions. */
	window.citySearchBox = new google.maps.places.SearchBox(cityInput, {
	  bounds: defaultBounds
	});
	/**
	* When the map is loaded at page startup, the program checks for stored data.
	*@event
	*/
    google.maps.event.addListenerOnce(map, 'idle', function(){
    	/** If stored data are not found, each item in the initialLocations array
    	is queried using the textSearch service. */
    	if (!localStorage.searchResults) {
    		initialLocations.forEach(function(item) {
				var request = {
				    location: baseLocation,
				    radius: '1000',
				    query: item
				};
				/** For each default location, a textSearch request is initiated
				to get details about the place and to dynamically populate the map. */
				service.textSearch(request, initialCallback); 
			});
			/** A call to the codeAddress function to request data about the city */
			codeAddress(geocoder, map, true);
			/** A call to the weather function to request information about the weather
			in the current city */
			weather(47.605881, -122.332047);
			/** A call to the times function to request news about the current city */
			times("Seattle WA");
		/** If stored data are found, they are loaded. */
		} else {
			/** A call to the loadData function which loads the stored data. */
			loadData();
		}
	});
}

/*
  * This function is responsible for placing markers on the map for searched places.
  *@function
  */
function placeMarkers(effectState) {
	/** A variable used with the timeOut function to assist in the DROP animation for
	the markers. */
	var counter = 0;
	/** An array sued with the setTimeOut function, the effectState aruguments selects
	between 0 for no DROP effect (during filtering) and 100 for DROP effect (After places search). */
	var timeDelay = [0, 100];
	/** An array which holds the possible animations fot the markers.
	The effectState argument specifies th index of the selected animation */
	var effect = [google.maps.Animation.NONE, google.maps.Animation.DROP];
	/** The searchResults array contains the places search results.
	For each item (location) in this array, a marker and an empty infoWindow are created. */
	searchResults().forEach(function(item){
		/** The setTimeout function is used so the markers DROP one after another,
		which gives a nice visual effect. */
		window.setTimeout(function() {
			markersAndInfoWindows.push(
  			{
  				marker: new google.maps.Marker({
  							map: map,
  							place: {
  								location: item.position(),
  								query: item.name()
  							},
  							title: item.name(),
  							animation: effect[effectState],
  							/** Custom markers are stored in markerIcons array, each
  							place is given a custom marker depending on the place 'type'
  							property which gets returned from the google textSearch service. */
  							icon: markerIcons[item.types()]
  			}),
  				infoWindow: new google.maps.InfoWindow({
  					content: " "
  			}) 
  			});
  			/** Once a marker and infoWindow for each location are created,
  			a call to createIW function is initiated. */
			if (counter == searchResults().length) {
				createIW();
			}
		}, counter*timeDelay[effectState]);
		counter++;
	});
}

/*
  * A function to search for a new city.
  *@function
  */
function codeAddress(geocoder, map, condition, searchBox, citySearchBox) {
    /** A variable which will hold the name of the city is declared */
    var address;
    /** the tempArray which temporarily holds the search results is emptied. */
    tempArray = [];
    /** If the argument condition is 1, it means the function was called for
    Seattle, so address is set to Seattle. If not, the address (or city) to be
    searched for is obtained from the input field 'city'. */
    if (condition) {
    	address = "Seattle";
    } else {
    	address = document.getElementById("city").value;	
    } 
    /** The geocode service which looks for the new city. */
    geocoder.geocode( { 'address': address}, function(results, status) {
    	/** If results are received, all or part of the lines in the if statements
    	are executed. */
	    if (status == google.maps.GeocoderStatus.OK) {
	      	/** If the city searched for is not Seattle, the following executes. */
	      	if (!condition) {
	      		/** The latitude of the returned city is stored */
	      		var latitude = results[0].geometry.location.lat();
	      		/** The longitude of the returned city is stored */
	      		var longitude = results[0].geometry.location.lng();
	      		/** The map is set to the new city. */
	      		map.setCenter(results[0].geometry.location);
	      		/** The map is zoomed to 14 */
	      		map.setZoom(14);
	      		/** The places searchBox is now biased to the new city to search
	      		for places in the new city */
	      		searchBox.setBounds(map.getBounds());
	      		/** The city searchBox is now biased to the new city */
	      		citySearchBox.setBounds(map.getBounds());
	      		/** The weather function is called with the position of the new city */
	      		weather(latitude, longitude);
	      		/** The times function is called with the new city to request news.*/
	      		times(address);
	      		/** The places filter input field is reset. */
	      		setFilter('');
	      	}
	      	/** The baseLocation is set to the current city whether it's the default
	      	or a new one. */
	      	baseLocation = results[0].geometry.location;
	      	/** A call to the cityMarker function to place a marker for the city. */
	      	cityMarker(results[0].address_components[0].long_name, baseLocation);
	    /** If an error occurs and the search fails, A message is alerted with
	    the type of the error. */
	    } else {
	      	alert("Cannot complete the requested search because of: " + status +
	      		  ". Check your connectoin and try again later.");
    	}
  	});
}

/**
  *	A function which places a DEFAULT marker on the map for the current city.
  *@function
  */
function cityMarker(city, position) {
	/** A city marker is defined and its Z-index is set to ensure that it appears
	on top of all other markers. */
	marker = new google.maps.Marker({
	    position: position,
	    map: map,
	    title: city,
	    zIndex: google.maps.Marker.MAX_ZINDEX + 1
    });
    /** The current city is stored locally to be retrieved after page reload. */
    localStorage.lastCity = marker.title;
    /** The latitude of the current city is stored locally to be retrieved after page reload. */
    localStorage.lastLat = marker.position.lat();
    /** The longitude of the current city is stored locally to be retrieved after page reload. */
    localStorage.lastLng = marker.position.lng();
}

/**
  * This function is called after the map is loaded if no data are stored.
  * It handles the textSearch request for every default place and returns information
  * abou that place.  
  *@function
  */
function initialCallback(results, status) {
	/** If a response is received, the follwing executes. */
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	/** If a search error is displayed in the results list, this lines
    	turns it off by call to a function which handles the results error messages. */
    	showResultsErrorMessage(false);
    	/** The first result (corresponding to the place of interest) is pushed to the
    	searchResults array. This results is pushed as a 'Location' object. */
  		searchResults.push(new Location(results[0]));
  		/** The first result (corresponding to the place of interest) is pushed to the
    	tempArray array. This results is pushed as a 'Location' object. */
  		tempArray.push(new Location(results[0]));
  		/** The map bounds are extended so that the place is shown on map. */
  		bounds.extend(results[0].geometry.location);
  	} else {
  		/** If the search fails, a call to the showResultsErrorMessage function 
  		is initiated to show an error message in the results list. */
  		showResultsErrorMessage(true);
  	}
  	/** This counter is used during initialization. */
	populationCounter++;
	if (populationCounter == 10) {
		/** When the counter is 10, it means that all 10 default locations have been found.
		The code then checks if a filter is in the local storage. */
		if (localStorage.filter) {
			/** If a results filter is found in local storage, the setFilter function is called
			to retrieve the saved filter */
			setFilter(localStorage.filter);
			/** A call to the filter function to filter the 10 locations according to the
			retrieved filter. */
			filter();
		} else {
			/** A call to placeMarkers function with an argument 1. The argument indicated
			a DROP animation for the markers with 100ms gap. */
			placeMarkers(1);
		}
	}
}

/**
  * This function is called when the user initiates a places search using the places search
  * bar.
  *@function
  */
function callback(results, status) {
	/** The tempArray is emptied. */
	tempArray = [];
	/** A new bounds object is declared. */
	bounds = new google.maps.LatLngBounds();
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	/** If the search request returns results, the results error message is hidden with
    	a call to the showResultsErrorMessage function. */
    	showResultsErrorMessage(false);
    	/** For each results item, the following lines are executed. */
    	for (var i = 0; i < results.length; i++) {
    		/** Each result item is pushed to the searchResults Array.
    		Each result is pushed as a 'Location' object */
      		searchResults.push(new Location(results[i]));
      		/** Each result item is pushed to the tempArray. each result is pushed as a 
      		'Location' object */
      		tempArray.push(new Location(results[i]));
      		/** The postion of each result item is pushed to the positionArray. Although this
      		information is saved in searchResults array as well, problems occur with saving the 
      		positions (when parsing the stored data during loading, the position information are
      		lost) unless they are saved in their own array. */
      		positionArray.push({lat: results[i].geometry.location.lat(),
      					   lng: results[i].geometry.location.lng()});
      		/** The bounds are extended for each result item. */
      		bounds.extend(results[i].geometry.location);
    	}
  	} else {
  		/** Error handler for a search request with no results returned. */
  		if (status == 'ZERO_RESULTS') {
  			/** A call for the showNoResultsMessage function to display appropriate message. */
  			showNoResultsMessage(true);
  		} else {
  			/** If the search fails any other reason, showResultsErrorMessage function is called. */
  			showResultsErrorMessage(true);
  		}
  	}
  	/** The map bounds are reset to include all the search results. */
  	map.fitBounds(bounds);
  	/**  */
	placeMarkers(1);
	/** A call to saveData function which saves the results of the search. */
	saveData(results, "", 1);
}

/**
  * This function saves the search results and the search filters.
  *@function
  */
function saveData(results, filter, selection) {
	/** If the argument selection is set to 1 (set to 1 by a places search event), 
	the following lines are executed. */
	if (selection) {
		/** The search results are stored locally. */
		localStorage.searchResults = JSON.stringify(results);
		/** The tempArray are stored locally. */
		localStorage.tempArray = JSON.stringify(results);
		/** The positionArray is stored locally. */
		localStorage.positionArray = JSON.stringify(positionArray);
		/** The current counds are stored locally. */
		localStorage.lastBounds = JSON.stringify(map.getBounds());
		/** The zoom level is stored locally. */
		localStorage.lastZoom = map.getZoom();
	} else {
		/** If selection is 0 (triggered by filtering the places search results), only the
		filter is stored locally. */
		localStorage.filter = filter;
	}
}

/**
  * This function loads the stored data.
  *@function
  */
function loadData() {
	/** Search restuls are loaded. */
	var temp = JSON.parse(localStorage.searchResults);
	/** Positions for all the places are loaded. */
	var tempPosition = JSON.parse(localStorage.positionArray);
	/** The map bounds are loaded. */
	var tempBounds = JSON.parse(localStorage.lastBounds);
	/** The southwest corner of the map's bounds is defined. */
	var sw = new google.maps.LatLng(tempBounds.O.O, tempBounds.j.j);
	/** The northeast corner of the map's bounds is defined. */
	var ne = new google.maps.LatLng(tempBounds.O.j, tempBounds.j.O);
	/** The zoom level is loaded. */
	var zoom = Number(localStorage.lastZoom);
	/** A new bounds object is declared. */
	var bounds = new google.maps.LatLngBounds();
	/** The last city os loaded. */
	var lastCity = localStorage.lastCity;
	/** The latitude of the last city is loaded. */
	var lastPositionLat = localStorage.lastLat;
	/** The longitude of the last city is loaded. */
	var lastPositionLng = localStorage.lastLng;
	/** The last filter value is loaded. */
	var lastFilter = localStorage.filter;
	/** The position object of the last city is built from last city's latitude and longitude.*/
	var lastPosition = {lat: Number(lastPositionLat),
					lng: Number(lastPositionLng)};
	/** The baseLocation is updated to the saved city. */
	baseLocation = lastPosition;

	for (var i = 0; i < temp.length; i++) {
		/** The searchResults array is filled with loaded data places. */
		searchResults.push(new Location(temp[i]));
		/** The position of each place is pushed to the searchResults array. */
		searchResults()[i].position(tempPosition[i]);
		/** The tempArray is filled with loaded data places. */
		tempArray.push(new Location(temp[i]));
		/** The position of each place is pushed to the tempArray. */
		tempArray[i].position(tempPosition[i]);
	}
	/** The bounds are extended to include the southwest corner. */
	bounds.extend(sw);
	/** The bounds are extended to include the northeast corner */
	bounds.extend(ne);
	/** The map bounds are reset to the saved data, */
	map.fitBounds(bounds);
	/** The map zoom level is reset to the saved data. */
	map.setZoom(zoom);
	/** The filter input field value is set to the saved value. */
	setFilter(lastFilter);
	/** The filter function is called to filter the places according to the loaded filter. */
	filter();
	/** The citMarker is called to add a city marker using the loaded data. */
	cityMarker(localStorage.lastCity, lastPosition);
	/** The weather function is called to retrieve weather data for the loaded city. */
	weather(Number(lastPositionLat), Number(lastPositionLng));
	/** The times function is called to retrieve news articles about the loaded city. */
	times(lastCity);
}

/**
  * This function is called when an infoWindow is opened to request detailed information
  * about the place of interest.
  *@function
  */
function details(place, status) {
	/** Checks if a call to the getDetails service was successful. */
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		/** The following forEach statement looks for the clicked marker (or item in the results
		list) and launches the setIwContent with information about the clicked place. */
		markersAndInfoWindows.forEach(function(pair){
			if (place.name == pair.marker.title) {
				setIwContent(pair.infoWindow, place);
			}
		});
	} else {
		/** If the getDetails request fails, the infoWindow of the clicked place will display
		and error message to the user. */
		markersAndInfoWindows.forEach(function(pair){
			pair.infoWindow.setContent("<span class='iw-error'>DATA COULDN'T BE" + 
										"RETREIVED,<br> PLEASE TRY AGAIN SHORTLY</SPAN>");
		});
	}
}

/**
  * This function adds an event listener to the places' markers on the map.
  *@function
  */
function createIW() {
	/** For each marker in the markersAndInfoWindows, a click event listener is defined. */
	markersAndInfoWindows.forEach(function(pair) {
		pair.marker.addListener('click', function() {
			/** A call to the closeIW function. Upon opening an infoWindow, this function
			closes any other open infoWindow. */
			closeIW();
			/** The code identifies the clicked marker and triggers a getDetails service
			for that place to get information for the contents of the infoWindow. */
			searchResults().forEach(function(item) {
				if (item.name() == pair.marker.title) {
					var name = item.name();
					/** The call to the getDetails service. */
					service.getDetails({placeId: item.placeId()}, details);
					/** A call to the isSettings to specify the settings for the infoWindow. */
					iwSettings(name);
				}
			});
		});
	});
}

/**
  * This function specifies some settings upon opening an infoWindow.
  *@function
  */
function iwSettings(name) {
	/** A latitude variable to which the map will be panned to upon opening an infoWindow. */
	var iwLat;
	/** A longitude variable to which the map will be panned to upon opening an infoWindow. */
	var iwLng;
	markersAndInfoWindows.forEach(function(pair) {
		if (name == pair.marker.title) {
			/** When the clicked place is identified, the marker is animated with BOUNCE for
			1500ms. */
			pair.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				pair.marker.setAnimation(null);
			}, 1500);

			/** the iwLat variable is defined. */
			iwLat = pair.marker.place.location.lat()+0.003;
			/** the iwLng variable is defined. */
			iwLng = pair.marker.place.location.lng();
			/** The map is panned to a point which propoerly shows the infoWindow on all devices. */
			map.panTo({lat: iwLat, lng: iwLng});
			/** The infoWindow is opened */
			pair.infoWindow.open(map, pair.marker);
			/** The zoom level is set to properly show the area around the opened infoWindow. */
			map.setZoom(15);
			/**
			  * If the window is resized (or device view switched between portrait and landscape),
			  * the mapped in panned to iwLat and iwLng to ensure the infoWindow stays in the middle
			  * of the display.
			  *@event
			  */
			google.maps.event.addDomListener(window, "resize", function() {
				/** It is checked to see if an infoWindow is open, if so, the map is panned. */
				if (isInfoWindowOpen(pair.infoWindow)){
					map.panTo({lat: iwLat, lng: iwLng});
				}
		    });
		}
	});
}

/**
  * This function sets the content of the infoWindow. 
  *@function
  */
function setIwContent(infoWindow, place) {
	/** The getDetails service returns photos for some places only. The if statements checks
	if the service returned a photo url or not. */
	if (place.photos){
		/** If a photo url is returned, it's saved into the imageUrl variable. */
		imageUrl = place.photos[0].getUrl({'maxWidth': 125});
	} else {
		/** If getDetails doesn't return a url, imageUrl is set to a default image (the no photo
		image). */
		imageUrl = 'images/noPhoto.jpg';
	}
	
	/** The results from the getDetails service are appended to the infoWindow. The information
	includes: place name, address, phone number, google+ page, rating, and an image. */
	infoWindow.setContent('<h4 class="iwTitle">'+place.name+'</h4>'+
		  				  '<span class="iwAddress">Address: '+place.address_components[0].short_name+
		  				  ' '+place.address_components[1].short_name+'</span>'+'<br>'+
		  				  '<span class="iwPhone">Phone: '+place.formatted_phone_number+'</span>'+'<br>'+
		  				  '<a target="blank" class="iwGoogle" href='+place.url+'>Click for Google+ page</a>'+'<br>'+
		  				  '<span class="iwRating">Rating: '+place.rating+'</span>'+'<br>'+
		  				  '<img class="iwImage" src='+imageUrl+'>');
}

/*
  * A function which closes any opened infoWindow upon opening a new one.
  *@function
  */
function closeIW() {
	/** For each infoWindow, a call to the isInfoWindowOpen is initiated to check if the
	infoWindow is openened. */
	markersAndInfoWindows.forEach(function(pair) {
		if (isInfoWindowOpen(pair.infoWindow)){
			/** If an infoWindow is opened, the following lline closes it. */
			pair.infoWindow.close();
		}
	});
}

/**
  * This function checks if any infoWindow is open. It is used to close an infoWindow
  * when another one is opened.
  *@function
  */
function isInfoWindowOpen(infoWindow){
    var map = infoWindow.getMap();
    return (map !== null && typeof map !== "undefined");
}

/**
  * The following function removes all markers on the map.
  *@function
  */
function clearMarkers() {
	markersAndInfoWindows.forEach(function(pair){
		/** All markers are cleared. */
		pair.marker.setMap(null);
	});
	/** The markersAndInfoWindows array is reset. */
	markersAndInfoWindows = [];
}

/**
  * The weather function places an AJAX request to collect weather information about
  * the current city.
  *@function
  */
function weather(lat, lng) {
	/** If present, the weather error message is hidden with a call to showWeatherErrorMessage
	function. */
	showWeatherErrorMessage(false);
	/** AJAX resuest to Open Weather Map using the latitude and longitude of the current city
	for accurate results. */
	$.ajax({
		url : "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"&appid=3b226624aed979fa47deafd7a85e8a1d",
	    /** If the request succeeds, the results JSON is parsed. */
	    success : function(parsed_json) {
		    var location = parsed_json.name;
		    var temp = Math.round(parsed_json.main.temp - 273);
		    var humidity = Math.round(parsed_json.main.humidity);
		    var condition = parsed_json.weather[0].description;
		    var clouds = parsed_json.clouds.all;
		    var wind = parsed_json.wind.speed;
		    /** An icon code is retrieved which specifies the weather conditions. */
		    var icon = parsed_json.weather[0].icon;
		    /** The weather icon is selected based on the icon code retrieved in the previous line. */
		    var iconUrl = "weather_images/"+icon+".png";
		    /** The information are pushed to the weatherArray which is used to display
		    weather information on the map using Knockout bindings. */
		    weatherArray.push({name: location, 
		    				   temperature: temp,
		    				   condition: condition,
		    				   clouds: clouds,
		    				   humidity: humidity,
		    				   wind: wind,
		    				   image: iconUrl});
		}
	}).error(function() {
		/** If the request fails, an error message is displayed in the weather div using the
		showWeatherErrorMessage function. */
		showWeatherErrorMessage(true);
	});
}

/**
  * The times function places an AJAX request to collect news articles about the current city.
  *@function
  */
function times(city) {
	/** If present, the NyTimes error message is hidden with a call to showTimesErrorMessage
	function. */
	showTimesErrorMessage(false);
	/** AJAX resuest to NyTimes using the name of the current city. */
	$.ajax({
		url : "http://api.nytimes.com/svc/search/v2/articlesearch.json?q="+city+"&api-key=2bc73c1c7c519ec64cc7f2873b9e8744:16:72970449",
	    /** If the request succeeds, the results JSON is parsed. and the headline for each
	    result item is pushed to the newsResults array which is used to display the list
	    of the news articles using Knockout bindings. */
	    success : function(parsed_json) {
	    	parsed_json.response.docs.forEach(function(item) {
	    		newsResults.push({headline: item.headline.main,
	    						  url: item.web_url});
	    	});
	    }
	}).error(function() {
		/** If the request fails, an error message is shown is the NyTimes div using the 
		showTimesErrorMessage function. */
		showTimesErrorMessage(true);
	});
}

/**
  * Location class. After a places search, each result item is pushed to the searchResults
  * and tempArray as an instance of the Location class. Each propoerty is saved as a Knockout
  * observable.
  *@class
  */
var Location = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.formatted_address);
	this.placeId = ko.observable(data.place_id);
	this.position = ko.observable(data.geometry.location);
	this.types = ko.observable(data.types[0]);
};

/**
  * The ViewModel which binds the DOM elemnts to the data.
  *@class
  */
var ViewModel = function() {
	/** A varialbe referring to results-wiki-div. */
	var resultsWikiDiv = $(".results-wiki-div");
	/** A varialbe referring to the weather-deatails div. */
	var weatherDetails = $(".weather-details");
	/** The searchResults array defined as an observable array. It is defined as a global
	array since it is accessed from different function outside the ModelView. This arrays
	is used to display weather information in the weather widget using Knockout bindings. */
	window.searchResults = ko.observableArray([]);
	/** The newsResults array defined as an observable array. It is defined as a global
	array since it is accessed from different function outside the ModelView. This array is
	used to display search results in the results list using Knockout bindings. */	
	window.newsResults = ko.observableArray([]);
	/** The weatherArray defined as an observable array. It is defined as a global
	array since it is accessed from different function outside the ModelView. This array
	is used to display headlines in the NyTimes list using Knockout bindings. */
	window.weatherArray = ko.observableArray([]);
	/** Using Knockout 'visible' binding, this observable variable defines the visiblity of 
	the 'no results message' shown in the results list when no results are returned by a places search. */
	noResultsMessage = ko.observable(false);
	/** Using Knockout 'visible' binding, this observable variable defines the visiblity of 
	the message shown in the results list when a new city is returned by a city search. */
	newCityMessage = ko.observable(false);
	/** Using Knockout 'visible' binding, this observable variable defines the visiblity of 
	the message shown in the results list when error occurs after a place search. */	
	resultsErrorMessage = ko.observable(false);
	/** Using Knockout 'visible' binding, this observable variable defines the visiblity of 
	the message shown in the NyTimes list when a news request fails. */	
	timesErrorMessage = ko.observable(false);
	/** Using Knockout 'visible' binding, this observable variable defines the visiblity of 
	the message shown in the weather widget when error occurs after a weather request fails. */	
	weatherErrorMessage = ko.observable(false);
	/** Using Knockout 'textInput' binding, this observable variable keeps track of the value
	of the filter input field. */
	filterValue = ko.observable('');
	/** Using Knockout 'textInput' binding, this observable variable keeps track of the value
	of the places search input field. */	
	searchPlaces = ko.observable('');
	/** Using Knockout 'attr' binding, this observable variable sets the placeholder attribute 
	of the place search input field. */
	searchPlaceholder = ko.observable("Find new places...");
	/** Using Knockout 'textInput' binding, this observable variable keeps track of the value
	of the city search input field. */
	searchCity = ko.observable('');

	/*
	* This function sets the value of the filter input field.
	*@function
	*/
	window.setFilter = function(value) {
		filterValue(value);
	};

	/*
	* This function controls the display of the weather error message. If 'value' is true,
	* the message is shown.
	*@function
	*/
	window.showWeatherErrorMessage = function(value) {
		weatherErrorMessage(value);
	};

	/*
	* This function controls the display of the NyTimes error message. If 'value' is true,
	* the message is shown.
	*@function
	*/
	window.showTimesErrorMessage = function(value) {
		timesErrorMessage(value);
	};

	/*
	* This function controls the display of the results error message. If 'value' is true,
	* the message is shown.
	*@function
	*/
	window.showResultsErrorMessage = function(value) {
		resultsErrorMessage(value);
	};

	/*
	* This function controls the display of the no results message. If 'value' is true,
	* the message is shown.
	*@function
	*/
	window.showNoResultsMessage = function(value) {
		noResultsMessage(value);
	};

	/**
	  * Knockout binds the submit event of 'city-search' form to this function. 
	  *@ function
	  */
	this.citySearch = function() {
		/** Removes the old city marker. */
		marker.setMap(null);
		/** Calls the codeAddress function to search for the new city. */
		codeAddress(geocoder, map, false, searchBox, citySearchBox);
		/** searchResults array is reset when city is changed. */
		searchResults([]);
		/** weatherArray is reset when the city is changed. */
		weatherArray([]);
		/** newsResults array is reset when the city is changed. */
		newsResults([]);
		/** Markers of places in the old city are cleared. */
		clearMarkers();
		/** The place search input field is reset. */
		searchPlaces('');
		/** filter in local storage is reset. */
		localStorage.filter = '';
		/** The placeholder of the place search input field is changed. */
		searchPlaceholder('Search for places in the new city!');
		/** If the 'no results message' is shown, it is hidden by calling the showNoResultsMessage
		function with a false value. */
		showNoResultsMessage(false);
		/** If the 'results error message' is shown, it is hidden by calling the showResultsErrorMessage
		function with a false value. */
		showResultsErrorMessage(false);
		/** The 'new city message' is shown in the results list by setting newCityMessage to true. */
		newCityMessage(true);
	};

	/**
	  * Knockout binds the results and news div with this function using 'click' binding.
	  * No binding were used to hide and display the weather and results divs in order to use
	  * jQuery's fadeToggle function.
	  *@funciton
	  */
	this.resultsToggle = function() {
		/** If the weather widget is open, it is closed by the next line. */
		$(weatherDetails).hide();
		/** the results div is faded in. */
		$(resultsWikiDiv).fadeToggle();
	};

	/**
	  * Knockout binds the 'close results' button with this function using 'click' binding.
	  *@function
	  */
	this.resultsClose = function() {
		/** The results div is faded out. */
		$(resultsWikiDiv).fadeOut();
	};

	/**
	  * Knockout binds each results element with this function using 'click' binding.
	  * This function opens infoWindow when a place in the results list is clicked.
	  *@function
	  */
	this.iw = function() {
		/** A call to the closeIW to close all open infoWindows, */
		closeIW();
		/** If the display width is less than 550px, the results div is faded out. */
		if ($(window).width() < 550) {
			$(resultsWikiDiv).fadeOut();
		}
		var name = this.name();
		/** The clicked place is identified and a getDetails request is initiated. */
		searchResults().forEach(function(item) {
			if (item.name() == name) {
				service.getDetails({placeId: item.placeId()}, details);
			}
		});
		/** A call to the iwSettings function to setup the infoWindow then open it. */
		iwSettings(name);
	};

	/**
	  * knockout binds the 'form' form (for place search) to this function using 'submit' binding.
	  *@function
	  */
	this.initiateSearch = function() {
		/** All markers are cleared. */
		clearMarkers();
		/** The filter field is reset. */
		setFilter('');
		/** filter in local storage is reset. */
		localStorage.filter = '';
		/** The 'new city message' in the results list is hidden (if initially displayed). */
		newCityMessage(false);
		/** The 'no results message' in the results list is hidden (if initially displayed). */
		showNoResultsMessage(false);
		/** The 'results error message' in the results list is hidden (if initially displayed). */
		showResultsErrorMessage(false);
		/** The searchResults array is reset. */
		searchResults([]);
		/** If the 'place search' input field contains a value, a textSearch request is triggered. */
		if (searchPlaces()) {
			var request = {
			    location: baseLocation,
			    radius: '500',
			    query: searchPlaces()
			};
			service.textSearch(request, callback); 
		} else {
			/** If the 'place search' input field doesn't contain a value, an error message is alerted. */
			alert("Nothing is entered");
		}
	};

	/**
	  * This function resets the map to its initial settings (default city and default places.)
	  *@funciton
	  */
	this.reset = function() {
		/** weatherArray is reset. */
		weatherArray([]);
		/** populationCounter is reset. */
		populationCounter = 0;
		/** searchResults array is reset. */
		searchResults([]);
		/** tempArray is reset. */
		tempArray = [];
		/** All stored data are deleted. */
		localStorage.clear();
		/** The initMap function is called to reload the map. */
		initMap();
		/** The 'city search' input field is reset. */
		searchCity('');
		/** The 'place search' input field is reset. */
		searchPlaces('');
		/** The 'filter' input field is reset. */
		setFilter('');
		/** The 'new city message' in the results list is hidden (if initially displayed). */
		newCityMessage(false);
		/** The 'results error message' in the results list is hidden (if initially displayed). */
		showResultsErrorMessage(false);
		/** The 'no results message' in the results list is hidden (if initially displayed). */
		showNoResultsMessage(false);
		/** The placeholder attribute of the 'place search' is reset to its default value. */
		searchPlaceholder('Find new places...');
	};

	/**
	  * Knockout binds the weather widget to this function using 'click' binding.
	  * This function opens and closes the weather widget. Knockout visible bindings were not
	  * in order to implement jQuery's fadeToggle functionality.
	  *@function
	  */
	this.weatherToggle = function() {
		/** If the results div initially open, it is closed. */
		$(resultsWikiDiv).hide();
		/** The weather div is faded in or out. */
		$(weatherDetails).fadeToggle();
	};

	/**
	  * Knockout binds the 'Close weather' button to this function using 'click' binding.
	  * Once clicked, the weather widget fades out.
	  *@function
	  */
	this.weatherClose = function() {
		$(weatherDetails).fadeToggle();
	};

	/**
	  * Knockout binds the filter input field to this function using 'event: keyup' binding.
	  * The function filters the places in the results list as well as the markers on the map.
	  *@function
	  */
	window.filter = function() {
		/** If the filter field has a value, the following lines are executed. */
		if (filterValue()) {
			/** The value of the filter field is switched to all small letters and saved to the
			variable filter. */
			var filter = filterValue().toLowerCase();
			/** All amrkers are cleared. */
			clearMarkers();
			/** searchResults array is reset. */
			searchResults([]);
			/** For each item in tempArray (which still has all the places), the filter string
			is searched for, if found, the item is pushed to the searchResults array. */
			tempArray.forEach(function(item) {
				if (item.name().toLowerCase().search(filter) > -1) {
					searchResults.push(item);
				}
			});
			/** The filter input field value is saved to local storage. */
			saveData("", filter, 0);
			/** Markers are placed for places in the searchResults array which now only contains
			the filtered places. A zero arguemnts indicated that the markers won't be animated
			when they are displayed on the map. */
			placeMarkers(0);
		/** If the filter field has no value (occurs after deleting the filter string), the
		following executes. */
		} else {
			/** All markers (resulting from filtering with a string on one letter) are cleared. */
			clearMarkers();
			/** searchResults (resulting from last filter) is reset. */
			searchResults([]);
			/** filter in local storage is reset. */
			localStorage.filter = '';
			/** All items in the tempArray (which still contains all the places before filtering)
			are pushed to the searchResults which will retain all the places. */
			tempArray.forEach(function(item) {
				searchResults.push(item);
			});
			/** Markers for all places are placed on the map by calling the placeMarkers function. */
			placeMarkers(0);
		}
	};
};

/** Apply Knockout bindings. */
ko.applyBindings(new ViewModel());