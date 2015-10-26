var bounds;
var map;
var markersAndInfoWindows = [];
var service;
var baseLocation;
var populationCounter = 0;
var tempArray = [];
var positionArray = [];

function initMap() {
	bounds = new google.maps.LatLngBounds();
	$('.results-error').hide();
	if (!localStorage.searchResults) {
		baseLocation = {lat: 47.605881, lng: -122.332047};
	}
  	map = new google.maps.Map(document.getElementById('map'), {
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

  	window.placeMarkers = function(effectState) {
  		var counter = 0;
  		var timeDelay = [0, 100];
  		var effect = [google.maps.Animation.NONE, google.maps.Animation.DROP]

  		searchResults().forEach(function(item){
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
		  							icon: markerIcons[item.types()]
		  			}),
		  				infoWindow: new google.maps.InfoWindow({
		  					content: " "
		  			}) 
		  			});
	  			if (counter == searchResults().length) {
	  				createIW();
	  			}

	  		}, counter*timeDelay[effectState]);
	  		counter++;
  		});
  		
    }

    var geocoder = new google.maps.Geocoder();

    google.maps.event.addListenerOnce(map, 'idle', function(){
    	if (!localStorage.searchResults) {
    		initialLocations.forEach(function(item) {
				var request = {
				    location: baseLocation,
				    radius: '1000',
				    query: item
				};
				service.textSearch(request, initialCallback); 
			});
			codeAddress(geocoder, map, true);
			weather(47.605881, -122.332047);
			times("Seattle WA");
		} else {
			loadData();
		}
	});   	

  	service = new google.maps.places.PlacesService(map);

  	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(47.55, -122.38),
		new google.maps.LatLng(47.65, -122.28));

	var input = document.getElementById('search-input');
	var cityInput = document.getElementById('city');

	var searchBox = new google.maps.places.SearchBox(input, {
	  bounds: defaultBounds
	});

	var citySearchBox = new google.maps.places.SearchBox(cityInput, {
	  bounds: defaultBounds
	});

	document.getElementById('city-search').addEventListener("submit", function(event) {
	  	event.preventDefault();
		marker.setMap(null); //removes the old city marker
		codeAddress(geocoder, map, false, searchBox, citySearchBox);
		searchResults([]);
		$("#search-input").val('');
		$("#search-input").attr('placeholder', 'Search for places in the new city!');
		$(".new-city").show();
	});
}

function loadData() {
	var temp = JSON.parse(localStorage.searchResults);
	var tempPosition = JSON.parse(localStorage.positionArray);
	for (var i = 0; i < temp.length; i++) {
		searchResults.push(new Location(temp[i]));
		searchResults()[i].position(tempPosition[i]);
		tempArray.push(new Location(temp[i]));
		tempArray[i].position(tempPosition[i]);
	}
	var tempBounds = JSON.parse(localStorage.lastBounds);
	var sw = new google.maps.LatLng(tempBounds.O.O, tempBounds.j.j);
	var ne = new google.maps.LatLng(tempBounds.O.j, tempBounds.j.O);
	var zoom = Number(localStorage.lastZoom);
	var bounds = new google.maps.LatLngBounds();
	var lastCity = localStorage.lastCity;
	var lastPositionLat = localStorage.lastLat;
	var lastPositionLng = localStorage.lastLng;
	var lastFilter = localStorage.filter;
	bounds.extend(sw);
	bounds.extend(ne);
	map.fitBounds(bounds);
	map.setZoom(zoom);
	lastPosition = {lat: Number(lastPositionLat),
					lng: Number(lastPositionLng)};
	baseLocation = lastPosition;
	$(".filter").val(lastFilter);
	filter();
	placeMarkers(1);
	cityMarker(localStorage.lastCity, lastPosition);
	weather(Number(lastPositionLat), Number(lastPositionLng));
	times(lastCity);
}

function codeAddress(geocoder, map, condition, searchBox, citySearchBox) {
    var address;
    tempArray = [];
    $('.results-error').hide();
    if (condition) {
    	address = "Seattle";
    } else {
    	address = document.getElementById("city").value;	
    } 
    geocoder.geocode( { 'address': address}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      	if (!condition) {
	      		map.setCenter(results[0].geometry.location);
	      		map.setZoom(14);
	      		searchBox.setBounds(map.getBounds());
	      		citySearchBox.setBounds(map.getBounds());
	      		clearMarkers();
	      		var latitude = results[0].geometry.location.lat();
	      		var longitude = results[0].geometry.location.lng();
	      		weather(latitude, longitude);
	      		times(address);
	      		$(".filter").val('');
	      	}
	      	baseLocation = results[0].geometry.location;
	      	cityMarker(results[0].address_components[0].long_name, baseLocation);
	    } else {
	      	alert("Geocode was not successful for the following reason: " + status);
    	}
  	});
}

function cityMarker(city, position) {
	marker = new google.maps.Marker({
	    position: position,
	    map: map,
	    title: city,
	    zIndex: google.maps.Marker.MAX_ZINDEX + 1
    });
    localStorage.lastCity = marker.title;
    localStorage.lastLat = marker.position.lat();
    localStorage.lastLng = marker.position.lng();
}

function callback(results, status) {
	tempArray = [];
	bounds = new google.maps.LatLngBounds();
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	$('.results-error').hide();
    	for (var i = 0; i < results.length; i++) {
      		searchResults.push(new Location(results[i]));
      		tempArray.push(new Location(results[i]));
      		positionArray.push({lat: results[i].geometry.location.lat(),
      					   lng: results[i].geometry.location.lng()});
      		bounds.extend(results[i].geometry.location);
    	}
  	} else {
  		if (status == 'ZERO_RESULTS') {
  			$(".no-results").show();
  		} else {
  			$('.results-error').show();
  		}
  	}
  	map.fitBounds(bounds);
	placeMarkers(1);
	saveData(results, "", 1);
}

function saveData(results, filter, selection) {
	if (selection) {
		localStorage.searchResults = JSON.stringify(results);
		localStorage.tempArray = JSON.stringify(results);
		localStorage.positionArray = JSON.stringify(positionArray);
		localStorage.lastBounds = JSON.stringify(map.getBounds());
		localStorage.lastZoom = map.getZoom();
	} else {
		localStorage.filter = filter;
	}
}

function initialCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	$('.results-error').hide();
  		searchResults.push(new Location(results[0]));
  		tempArray.push(new Location(results[0]));
  		bounds.extend(results[0].geometry.location);
  	} else {
  		$('.results-error').show();
  	}
	populationCounter++;
	
	if (populationCounter == 10) {
		if (localStorage.filter) {
			$(".filter").val(localStorage.filter);
			filter();
		} else {	//the function filter has a call to filter.
			placeMarkers(1);
		}
	}
}

function details(place, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		markersAndInfoWindows.forEach(function(pair){
			if (place.name == pair.marker.title) {
				setIwContent(pair.infoWindow, place);
			}
		})
	} else {
		markersAndInfoWindows.forEach(function(pair){
			pair.infoWindow.setContent("<span class='iw-error'>DATA COULDN'T BE" + 
										"RETREIVED,<br> PLEASE TRY AGAIN SHORTLY</SPAN>");
		})
	}
}

function setIwContent(infoWindow, place) {
	if (place.photos){
		imageUrl = place.photos[0].getUrl({'maxWidth': 125});
	} else {
		imageUrl = 'images/noPhoto.jpg';
	}
	
	infoWindow.setContent('<h4 class="iwTitle">'+place.name+'</h4>'+
		  				  '<span class="iwAddress">Address: '+place.address_components[0].short_name+
		  				  ' '+place.address_components[1].short_name+'</span>'+'<br>'+
		  				  '<span class="iwPhone">Phone: '+place.formatted_phone_number+'</span>'+'<br>'+
		  				  '<a target="blank" class="iwGoogle" href='+place.url+'>Click for Google+ page</a>'+'<br>'+
		  				  '<span class="iwRating">Rating: '+place.rating+'</span>'+'<br>'+
		  				  '<img class="iwImage" src='+imageUrl+'>')
}

function createIW() {
	markersAndInfoWindows.forEach(function(pair) {
		pair.marker.addListener('click', function() {
			searchResults().forEach(function(item) {
				if (item.name() == pair.marker.title) {
					service.getDetails({placeId: item.placeId()}, details);
				}
			})
			map.panTo({lat: pair.marker.place.location.lat()+0.003, 
					  lng: pair.marker.place.location.lng()});
			pair.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				pair.marker.setAnimation(null);
			}, 1500)
			pair.infoWindow.open(map, pair.marker);
			map.setZoom(15);
		})
	})
}

var Location = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.formatted_address);
	this.placeId = ko.observable(data.place_id);
	this.position = ko.observable(data.geometry.location);
	this.types = ko.observable(data.types[0]);
}

var initialLocations = ["Seattle Aquarium", "Harborview Medical Center",
						"Sky View Observatory", "Washington State Convention Center",
						"Space Needle", "Cinerama", "Cal Anderson Park Fountain",
						"Seattle Center", "Westlake Center", "Pike Place Fish Market"]

function clearMarkers() {
	markersAndInfoWindows.forEach(function(pair){
		pair.marker.setMap(null);
	});
	markersAndInfoWindows = [];
}

var ViewModel = function() {
	var self = this;
	var resultsWikiDiv = $(".results-wiki-div");
	var weatherDetails = $(".weather-details");

	window.searchResults = ko.observableArray([]);
	window.newsResults = ko.observableArray([]);
	window.weatherArray = ko.observableArray([]);

	this.resultsToggle = function() {
		$(weatherDetails).hide();
		$(resultsWikiDiv).fadeToggle();
	};

	this.resultsClose = function() {
		$(resultsWikiDiv).fadeOut();
	};

	this.iw = function() {
		if ($(window).width() < 550) {
			$(resultsWikiDiv).fadeOut();
		}
		var name = this.name();

		searchResults().forEach(function(item) {
			if (item.name() == name) {
				service.getDetails({placeId: item.placeId()}, details);
			}
		})

		markersAndInfoWindows.forEach(function(pair) {
			if (name == pair.marker.title) {
				pair.marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function() {
					pair.marker.setAnimation(null);
				}, 1500)
				map.panTo({lat: pair.marker.place.location.lat()+0.003,
						  lng: pair.marker.place.location.lng()});
				pair.infoWindow.open(map, pair.marker);
				map.setZoom(15);
			}
		})
	};

	this.initiateSearch = function() {

		clearMarkers();
		$(".filter").val('');
		$(".new-city").hide();
		$(".no-results").hide();
		searchResults([]);

		if ($("#search-input").val()) {
			var request = {
			    location: baseLocation,
			    radius: '500',
			    query: $("#search-input").val()
			};
			service.textSearch(request, callback); 
		} else {
			alert("Nothing is entered");
		}
	};

	this.reset = function() {
		populationCounter = 0;
		searchResults([]);
		tempArray = [];
		localStorage.clear();
		initMap();
		$("#city").val('');
		$("#search-input").val('');
		$(".filter").val('');
		$(".new-city").hide();
		$(".results-error").hide();
	};

	this.weatherToggle = function() {
		$(resultsWikiDiv).hide();
		$('.weather-details').fadeToggle();
	}

	this.weatherClose = function() {
		$('.weather-details').fadeToggle();
	}

	window.filter = function() {
		var filter = $(".filter").val().toLowerCase();
		if (filter) {
			clearMarkers();
			searchResults([]);
			tempArray.forEach(function(item) {
				if (item.name().toLowerCase().search(filter) > -1) {
					searchResults.push(item);
				}
			})
			saveData("", filter, 0);
			placeMarkers(0);
		} else {
			clearMarkers();
			searchResults([]);
			localStorage.filter = '';
			tempArray.forEach(function(item) {
				searchResults.push(item);
			});
			placeMarkers(0);
		}
	}
}

function weather(lat, lng) {
	weatherArray([]);
	$.ajax({
		url : "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"&appid=3b226624aed979fa47deafd7a85e8a1d",
	    success : function(parsed_json) {
		    var location = parsed_json.name;
		    var temp = Math.round(parsed_json.main.temp - 273);
		    var humidity = Math.round(parsed_json.main.humidity);
		    var condition = parsed_json.weather[0].description;
		    var clouds = parsed_json.clouds.all;
		    var wind = parsed_json.wind.speed;
		    var icon = parsed_json.weather[0].icon;
		    var iconUrl = "weather_images/"+icon+".png"
		    
		    weatherArray.push({name: location, 
		    				   temperature: temp,
		    				   condition: condition,
		    				   clouds: clouds,
		    				   humidity: humidity,
		    				   wind: wind,
		    				   image: iconUrl});
		}
	}).error(function() {
		$('.weather-details').append("<span style='font-size: 13px'>WEATHER "+
		 "DATA COUDLN'T BE RETREIVED, PLEASE TRY AGAIN SHORTLY</span>");
	})
}

function times(city) {
	newsResults([]);
	$.ajax({
		url : "http://api.nytimes.com/svc/search/v2/articlesearch.json?q="+city+"&api-key=2bc73c1c7c519ec64cc7f2873b9e8744:16:72970449",
	    success : function(parsed_json) {
	    	parsed_json.response.docs.forEach(function(item) {
	    		newsResults.push({headline: item.headline.main,
	    						  url: item.web_url});
	    	})
	    }
	}).error(function(e) {
		$('.wiki').append("<span style='font-size: 14px; color: white'>NYTIMES ARTICLES "+
		 "COULDN'T BE RETREIVED, PLEASE TRY AGAIN SHORTLY</span>");
	})
}

ko.applyBindings(new ViewModel());