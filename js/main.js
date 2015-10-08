var map;
var markersAndInfoWindows = [];
var service;
var liveSearch = [];
var baseLocation = {lat: 47.605881, lng: -122.332047};

function initMap() {
	
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
  		liveSearch.forEach(function(item){
  			markersAndInfoWindows.push(
	  			{
	  				marker: new google.maps.Marker({
	  							map: map,
	  							place: {
	  								location: item.position(),
	  								query: item.name()
	  							},
	  							title: item.name(),
	  							animation: google.maps.Animation.DROP
	  			}),
	  				/*infoWindow: new google.maps.InfoWindow({
	  					content: '<h4 class="iwTitle">'+item.name+'</h4>'+
	  					'<span class="iwAddress">'+item.address+'</span>'+'<br>'+
	  					'<a class="iwUrl" href="'+item.url+'" target="blank">'+item.url+'</a>'+'<br>'+
	  					'<img class="iwImage" src='+item.image+'>'
	  			}) */
	  			});
  		})
  	}

  	initialLocations.forEach(function(item) {
  		markersAndInfoWindows.push(
  			{
  				marker: new google.maps.Marker({
  							map: map,
  							place: {
  								location: item.position,
  								query: item.name
  							},
  							title: item.name
  			}),
  				infoWindow: new google.maps.InfoWindow({
  					content: '<h4 class="iwTitle">'+item.name+'</h4>'+
  					'<span class="iwAddress">'+item.address+'</span>'+'<br>'+
  					'<a class="iwUrl" href="'+item.url+'" target="blank">'+item.url+'</a>'+'<br>'+
  					'<img class="iwImage" src='+item.image+'>'
  			}) 
  			});
  	});
  	createIW();
  	service = new google.maps.places.PlacesService(map);
}

function callback(results, status) {
	liveSearch = [];
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	for (var i = 0; i < results.length; i++) {
      		liveSearch.push(new Location(results[i]));
    	}
  	} else {
  		alert("Search request failed");
  	}
  	searchDone();
}

function createIW() {
	markersAndInfoWindows.forEach(function(pair) {
		pair.marker.addListener('click', function() {
			pair.infoWindow.open(map, pair.marker);
		})
	})
}

var Location = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.formatted_address);
	this.placeId = ko.observable(data.place_id);
	this.position = ko.observable(data.geometry.location);
}

var initialLocations = [
	{
		name: "Seattle Aquarium",
		address: "1483 Alaskan Way",
		url: "http://www.seattleaquarium.org",
		position: {lat: 47.607467, lng: -122.343013},
		image: "images/aquarium.jpg"
	},
	{
		name: "Harborview Medical Center",
		address: "325 9th Ave",
		url:"http://uwmedicine.washington.edu",
		position: {lat: 47.603517, lng: -122.323087},
		image: "images/harborview.jpg"
	},
	{
		name: "Sky View Observatory",
		address: "701 5th Ave",
		url: "http://www.skyviewobservatory.com",
		position: {lat: 47.604590, lng: -122.330473},
		image: "images/skyview.jpg"
	},
	{
		name: "Washington State Convention Center",
		address: "800 Convention Pl",
		url: "http://www.wscc.com/",
		position: {lat: 47.611482, lng: -122.332165},
		image: "images/wscc.jpg"
	},
	{
		name: "Space Needle",
		address: "400 Broad St",
		url: "http://www.spaceneedle.com/",
		position: {lat: 47.620506, lng: -122.349256},
		image: "images/spaceneedle.jpg"
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

	this.searchResults = ko.observableArray([]);

	initialLocations.forEach(function(locationItem) {
		self.searchResults.push(locationItem);
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
		var name = this.name;
		markersAndInfoWindows.forEach(function(pair) {
			if (name == pair.marker.title) {
				pair.infoWindow.open(map, pair.marker);
			}
		})
	};

	window.searchDone = function() {
		liveSearch.forEach(function(item) {
			self.searchResults.push({name: item.name});
		})
		placeMarkers();
	};

	this.initiateSearch = function() {
		self.searchResults([]);

		clearMarkers();

		if ($(".search-input").val()) {
			if ($(window).width() < 550) {
				$(resultsDiv).show();
			}
			var request = {
			    location: baseLocation,
			    radius: '5000',
			    query: $(".search-input").val()
			};
			service.textSearch(request, callback); 
		} else {
			self.searchResults([]);
		}
	};
}

ko.applyBindings(new ViewModel());

