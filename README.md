Neighbourhood Map Project (Udacity Front-end Nanodegree)
========================================================
Welcome to The neighbourhood map!
In this webpage, you can explore, search and filter locations of interest in a city of choice.

Features include:
========================================================
	- Weather and NyTimes articles about the city.

	- Search locations of interest and filter the results by name.

	- Custom map markers depending on the type of the location of interest.

	- Search in any city of choice.

	- Upon reloading the page or reopening, data persists.

	- Ability to reset the map to its default view.

Startup and Layout:
========================================================
Upon loading the page for the first time, it can be seen that the page consists of three main sections:

	- Map section.

	- Search and weather section.

	- Results section.

Map section: 
The map section displays the neighbourhood (city) of interest. The default city in this page is Seattle.
There are also ten places of interest in Seattle shown on the map ny default. Each place has its custom marker depending on its type, custom markers are provided for 35 types of places.

Search and weather section (top section):
This section includes the weather widget button, a city search bar (top search bar) and a places-search bar (bottom search bar).

Results section (left pane):
This section includes the places-search results and the filter input field (top half), and the NyTimes articles about the current city (bottom half).

NOTE: When a small screen size is used (less than 550 px wide), the results section is hidden by default. A results button will appear to the left of the places-search bar. This button can be clicked to show the results section. To close the section, click on the results button again or click the 'Close list' button appearing below the NyTimes articles list.  

Map controls:
========================================================
The map contorls include:

	- Map type (top left corner): the default view is the Satellite view, the user can change to it map view.

	- Reset map (top left corner): this button can be clicked at any time to return to the default city and default places of interest and delete all locally stored data.

	- google sign-in (top right corner): the user has the ability to login to their google account, this enables the user to save any location to google maps.

	- Streetview (bottom right corner).

	- Zoom controls (bottom right corner).

	- Tilt control (bottom right corner): this is enabled at a certain zoom level for selected cities.

Exploring places:
========================================================
The items in the results list (left pane, top half) correspond to the markers shown on the map. To explore a place of interest simply click its marker on the map, or click on its name in the results list.
Once a marker or an item is clicked, that place's marker will be bounce for 2 seconds and an infoWindow will be opened and centered on the screen. Only one infoWindow can be opened at a time (upon opening an infoWindow, any other infoWindow will b automatically closed).

An infoWindow contains the following information:

	- The place name.

	- The address.

	- The phone number.

	- A link to the place's Google+ page.

	- The user ratings.

	- An image of the place (if available from Google's Place Services).

	- An option to save the place to Google Maps.

To close an infoWindow, simply click on (X) on the top right corner.

Filtering the results list:
========================================================
Right above the results list, there is a small input field to filter the places in the results list.
To filter the places, type a string. As a key is pressed on the keyboard, the results are filtered. This can be seen as the places in the results list are updated as well as the markers on the map. The places shown are the places which have the string entered in their name.

To view the whole list and all the markers again, simply delete the entered filter string.

Searching for new places:
========================================================
By default, the map shows 10 places of interest in Seattle. The user has the ability to search for any place or any type of places of interest in the city.

To search for new places, enter the place name or place type (for example: University of Washington or School) in the places-search bar in the search section (bottom search bar with a the text 'Find new places...') and then press enter or the Go button to the right.

Once the search is done, the result list will now be updated and the new search results are shown. The old markers on the map will removed and new markers corresponding to the new search results will be dropped on the map. The marker icon will depend on the type of the place returned.

Each place of the new results list can be explored as explained in the 'Exploring places' section, and they can also be filtered as explained in the 'Filtering the results list' section.

Weather:
========================================================
In the search section there is a 'Weather button' (top left corner of the page). Once clicked, a small weather widget will open showing weather information about the current city.

The information provided are:

	- Weather icon (image) showing the current weather conditions.

	- City's name and current temperature in celcius.

	- Weather condition.

	- Clouds.

	- Humidity.

	- Wind speed.

	- 'Close weather' button.

Changing the city: Upon changing the city, the weather information will updated to the new city's information.

Closing weather widget: to close the weather widget, click on the 'Weather' button again or click on the 'Close weather' button.

NyTimes:
========================================================
In the left pane (bottom half) the NyTimes articles can be shown. The headlines of the NyTimes articles relevant to the current city are shown. To view an article, click on the headline and a new page will open displaying the full article.

Changing the city: once the ciry is changed, the articles list will be updated with articles relevant to the new city. 

Changing the city:
========================================================
The user has the ability to the current city to any city of choice. This can be done using the City searc-bar at the top of the page (the bar has the text 'Change the city...').

To change the city, enter its name and then press enter or click on 'Go' to the right.
Once the search is done, the following occurs:

	- All markers are removed except for the new city's marker.

	- The results list will be empty until the user searches for ne places.

	- The weather information will be updated to the new city's information.

	- The NyTimes articles will be updated to articles relevant to the new city.

The user now will need to search for and filter new places as described in previous sections.

Saving data:
========================================================
Data saving to local storage is triggered in two ways:

	- After a new places-search.

	- After a filter has been applied.

Upon reloading or closing and reopening the page. The map will view the last places searched/filtered.
If the user changes the city but does not perform a places search, the new city will not be saved.

To return to the default view and default places, reset the map as described in the next section. 

Reset:
========================================================
The 'Reset' button shown at the top left corner of the map can be used to reset the map.
Once clicked, the map will return to its default city (Seattle) and the default places (10 places in Seattle). All previous information about searched places and filters will be deleted. 

Error messages:  
========================================================
The following error messages are shown to the user as described:

	- An alert window will be shown in case the map fails to load.

	- Upon opening an infoWindow, the message "DATA COULDN'T BE RETREIVED PLEASE TRY AGAIN SHORTLY" indicates a failure in retrieving details about the explored place.

	- Upon searching for a new city, an alert displaying the message "Cannot complete the requested search because of: STATUS. Check your connectoin and try again later." will be shown. STATUS indicates the reason of the search failure. NOTE: If city search fails, results list, weather, NyTimes list will all be cleared and no error will be shown in their sections.

	- Upon searching for a new city, the message "Please use the search bar to look for places in the new city" will be shown in the results list asking the user to search for places using the places search-bar.

	- Upon searching for new places, the message "No results, please use the search bar to find new places." indicates that no results were returned for the entered text.

	- Upon searching for new places, the message "DATA COULDN'T BE RETREIVED, PLEASE TRY AGAIN SHORTLY." indicated a failure due to different reasons (internet disconnection for example).

	- In the weather widget, the message "WEATHER DATA COUDLN'T BE RETREIVED, PLEASE TRY AGAIN SHORTLY" indicates a failure in data weather request.

	- In the NyTimes section, the message "NYTIMES ARTICLES COULDN'T BE RETREIVED, PLEASE TRY AGAIN SHORTLY" indicates a failure in the request for new articles.