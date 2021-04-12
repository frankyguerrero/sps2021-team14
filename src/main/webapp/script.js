// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var pos;
var map;
var bounds;
var infoWindow;
var currentInfoWindow;
var service;
var infoPane;
var fastFood = [];
var resetFlag = false;
var markers = [];

// code source: https://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
// read each line of the text file and add to fastFood array
const file = "uniqueFastFoods.txt"
//const reader = new FileReader();

function parseFile(file) {
    $.get(file, function(data) {
        const allLines = data.split("\n");
        allLines.forEach((line) => {
            fastFood.push(line);
        });
    });
}



/*reader.onload = (event) => {
        const file = event.target.result;
        const allLines = file.split("\n");
        // Reading line by line
        
};

reader.onerror = (event) => {
        alert(event.target.error.name);
};*/



//Get user position, if possible
function initPosition()
{
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    parseFile(file)
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(position => {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            initMap(pos, infoWindow);            
        }, () =>
        {
            handleLocationError(true,infoWindow);
        });
    }
    else
    {
        handleLocationError(false, infoWindow);
    }    
}

//Function to initalize map after getting user's position
function initMap(pos, infoWindow) {
  
    currentInfoWindow = infoWindow;

    infoPane = document.getElementById('sidePanel');

    map = new google.maps.Map(document.getElementById('map'),{
        center: pos,
        zoom: 15
    });

    bounds.extend(pos);
    infoWindow.setPosition(pos);
    infoWindow.setContent('Location found.');
    infoWindow.open(map);
    map.setCenter(pos);

    //getNearbyPlaces(pos);
}


// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
    // Set default location to Tokyo, Japan
    pos = { lat: 35.676, lng: 139.650 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
    });
    // Display an InfoWindow at the map center
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
    'Geolocation permissions denied. Using default location.' :
    'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
    currentInfoWindow = infoWindow;

    // Call Places Nearby Search on the default location
    //getNearbyPlaces(pos);
    getNearbyPlaces();
}


// Perform a Places Nearby Search Request
function getNearbyPlaces() {
    if(resetFlag === false)
    {
        document.getElementById('map').style.visibility = 'visible';
        event.preventDefault();
        var searchStr = document.getElementById('foodInput').value;

        
        let request = {
            location: pos,
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: searchStr
        };

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, nearbyCallback);
        resetFlag = true;
    }
    else
    {
        deleteMarkers();
        bounds = new google.maps.LatLngBounds();
        bounds.extend(pos);
        map.fitBounds(bounds);
        resetFlag = false;
        getNearbyPlaces();
    }
    
}


 // Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers(results);
    }
}

// Set markers at the location of each place result
function createMarkers(places) {
      places.forEach(place => {
        if(fastFood.includes(place.name) == false) {
            let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
            });

            google.maps.event.addListener(marker, 'click', () => {
            const request = {
                placeId: place.place_id,
                fields: ['name', 'formatted_address', 'geometry', 'rating',
                'website', 'photos']
            };

            service.getDetails(request, (placeResult, status) => {
                showDetails(placeResult, marker, status)
            });
            });

            markers.push(marker);
            // Adjust the map bounds to include the location of this marker
            bounds.extend(place.geometry.location);
        }  
      });
      map.fitBounds(bounds);
}

//Shows details for each marker when clicked
function showDetails(placeResult, marker, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        let placeInfowindow = new google.maps.InfoWindow();
        let rating = "None";
        if (placeResult.rating) rating = placeResult.rating;
        placeInfowindow.setContent('<div><strong>' + placeResult.name +
          '</strong><br>' + 'Rating: ' + rating + '</div>');
        placeInfowindow.open(marker.map, marker);
        currentInfoWindow.close();
        currentInfoWindow = placeInfowindow;
        showPanel(placeResult);
      } else {
        console.log('showDetails failed: ' + status);
      }
}


    // Displays place details in a sidebar
    function showPanel(placeResult) {
      // If infoPane is already open, close it
      if (infoPane.classList.contains("open")) {
        infoPane.classList.remove("open");
      }

      // Clear the previous details
      while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
      }

      // Add  photo, if there is one
      if (placeResult.photos) {
        let firstPhoto = placeResult.photos[0];
        let photo = document.createElement('img');
        photo.classList.add('hero');
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
      }

      // Add place details with text formatting
      let name = document.createElement('h5');
      name.classList.add('place');
      name.textContent = placeResult.name;
      infoPane.appendChild(name);
      if (placeResult.rating) {
        let rating = document.createElement('p');
        rating.classList.add('details');
        rating.textContent = `Rating: ${placeResult.rating} \u272e`;
        infoPane.appendChild(rating);
      }
      let address = document.createElement('p');
      address.classList.add('details');
      address.textContent = placeResult.formatted_address;
      infoPane.appendChild(address);
      if (placeResult.website) {
        let websitePara = document.createElement('p');
        let websiteLink = document.createElement('a');
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
      }

      // Open the infoPane
      infoPane.classList.add("open");
}


function deleteMarkers()
{
    for(var i = 0; i < markers.length; i++)
    {
        markers[i].setMap(null);
    }
    markers = [];
}


