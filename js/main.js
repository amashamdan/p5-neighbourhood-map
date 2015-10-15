var bounds;
var map;
var markersAndInfoWindows = [];
var service;
var baseLocation = {lat: 47.605881, lng: -122.332047};

function initMap() {
	bounds = new google.maps.LatLngBounds();
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

  	window.placeMarkers = function() {
  		var counter = 0;
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
		  							animation: google.maps.Animation.DROP,
		  							icon: markerIcons[item.types()]
		  			}),
		  				infoWindow: new google.maps.InfoWindow({
		  					content: " "
		  			}) 
		  			});
	  			if (counter == searchResults().length) {
	  				createIW();
	  			}

	  		}, counter*100);
	  		counter++;
  		});
  		
    }

    google.maps.event.addListenerOnce(map, 'idle', function(){
	    placeMarkers();
	});
  	service = new google.maps.places.PlacesService(map);

  	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(-33.8902, 151.1759),
		new google.maps.LatLng(-33.8474, 151.2631));

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
		var geocoder = new google.maps.Geocoder();
		codeAddress(geocoder, map);
	});
}

function codeAddress(geocoder, map) {
    var address = document.getElementById("city").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      	map.setCenter(results[0].geometry.location);
	      	baseLocation = results[0].geometry.location;
	    } else {
	      	alert("Geocode was not successful for the following reason: " + status);
    	}
  	});
}

function callback(results, status) {
	bounds = new google.maps.LatLngBounds();
	while (searchResults().length > 0) {
		searchResults().pop();
	}

    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	for (var i = 0; i < results.length; i++) {
      		searchResults.push(new Location(results[i]));
      		bounds.extend(results[i].geometry.location);
    	}
  	} else {
  		alert("Search request failed");
  	}
  	map.fitBounds(bounds);
  	searchDone();
}

function details(place, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		markersAndInfoWindows.forEach(function(pair){
			if (place.name == pair.marker.title) {
				setIwContent(pair.infoWindow, place);
			}
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
			map.panTo({lat: pair.marker.place.location.lat()+0.01, 
					  lng: pair.marker.place.location.lng()});
			pair.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				pair.marker.setAnimation(null);
			}, 1500)
			pair.infoWindow.open(map, pair.marker);
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

var initialLocations = [
	{
		name: "Seattle Aquarium",
		formatted_address: "1483 Alaskan Way, Seattle WA United States",
		url: "http://www.seattleaquarium.org",
		geometry: {location: {lat: 47.607467, lng: -122.343013}},
		image: "images/aquarium.jpg",
		place_id: "ChIJ06-9aLJqkFQRsRXmsyawZbk",
		types: ["aquarium"]
	},
	{
		name: "Harborview Medical Center",
		formatted_address: "325 9th Ave, Seattle WA United States",
		url:"http://uwmedicine.washington.edu",
		geometry: {location: {lat: 47.603517, lng: -122.323087}},
		image: "images/harborview.jpg",
		place_id: "ChIJsaW7rLlqkFQRdge3Wex61mc",
		types: ["establishment"]
	},
	{
		name: "Sky View Observatory",
		formatted_address: "701 5th Ave, Seattle WA United States",
		url: "http://www.skyviewobservatory.com",
		geometry: {location: {lat: 47.604590, lng: -122.330473}},
		image: "images/skyview.jpg",
		place_id: "ChIJi-OPx7BqkFQR9TDCUWqViHc",
		types: ["establishment"]
	},
	{
		name: "Washington State Convention Center",
		formatted_address: "800 Convention Pl, Seattle WA United States",
		url: "http://www.wscc.com/",
		geometry: {location: {lat: 47.611482, lng: -122.332165}},
		image: "images/wscc.jpg",
		place_id: "ChIJxzwPCbVqkFQRabwmIXYs0zg",
		types: ["establishment"]
	},
	{
		name: "Space Needle",
		formatted_address: "400 Broad St, Seattle WA United States",
		url: "http://www.spaceneedle.com/",
		geometry: {location: {lat: 47.620506, lng: -122.349256}},
		image: "images/spaceneedle.jpg",
		place_id: "ChIJ-bfVTh8VkFQRDZLQnmioK9s",
		types: ["establishment"]
	},
];

function clearMarkers() {
	markersAndInfoWindows.forEach(function(pair){
		pair.marker.setMap(null);
	});
	markersAndInfoWindows = [];
}

var ViewModel = function() {
	var self = this;
	var resultsDiv = $(".results-div");

	window.searchResults = ko.observableArray([]);

	initialLocations.forEach(function(locationItem) {
		searchResults.push(new Location(locationItem));
	});

	this.resultsToggle = function() {
		$(resultsDiv).fadeToggle();
	};

	this.resultsClose = function() {
		$(resultsDiv).fadeOut();
	};

	this.iw = function() {
		if ($(window).width() < 550) {
			$(resultsDiv).fadeOut();
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
				map.panTo({lat: pair.marker.place.location.lat()+0.01,
						  lng: pair.marker.place.location.lng()});
				pair.infoWindow.open(map, pair.marker);
			}
		})
	};

	window.searchDone = function() {
		map.panTo(baseLocation);
		placeMarkers();
	};

	this.initiateSearch = function() {

		clearMarkers();

		if ($("#search-input").val()) {
			if ($(window).width() < 550) {
				$(resultsDiv).show();
			}
			var request = {
			    location: baseLocation,
			    radius: '1000',
			    query: $("#search-input").val()
			};
			service.textSearch(request, callback); 
		} else {
			searchResults([]);
			alert("Nothing is entered");
		}
	};
}

ko.applyBindings(new ViewModel());