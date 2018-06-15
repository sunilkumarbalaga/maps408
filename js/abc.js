var  map;
var  infoWindow;
var  locations = [
  {
    Subject: 'Rigby Falls',
    location: {
      lat:-20.824183,
      lng:139.905318
    }
  },  {
    Subject: 'Melbourne Cricket Ground',
    location: {
      lat: -37.8199669,
      lng:144.9834493
    }
  }, {
    Subject: 'Arthurs Peak',
    location: {
      lat:-43.1858883,
      lng: 147.9047922
    }
  }, {
    Subject: 'Karlamilyi National Park',
    location: {
      lat:-22.46495,
      lng:  122.26116
    }
  }, {
    Subject: 'Sydney Opera House',
    location: {
      lat: -33.8567844,
      lng:151.2152967
    }
  }, {
    Subject: 'Wave Rock',
    location: {
      lat: -32.4436932,
      lng: 118.8970961
      
    }
  }
];
// Function to initialising the Google maps
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat:  -33.8567844,
      lng:151.2152967
    },
    zoom: 20,
    MAPTYPEControl: false
  });

  var  largeInfowindow = new google.maps.InfoWindow();
  infoWindow = new google.maps.InfoWindow();
  var  bounds = new google.maps.LatLngBounds();
  // The following group uses the location array to create an array of markers on initialize.
  for (var  b = 0; b < locations.length; b++) {
    // Get the position from the location array.
    var  position = locations[b].location;
    var  Subject = locations[b].Subject;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      Subject: Subject,
      animation: google.maps.Animation.DROP,
      id:b
    });
    //Marker gets to be visible by default
    marker.setVisible(true);
    // markers.push(marker);
    rt.locationsList()[b].marker = marker;
    // Create an onclick event to open the large infowindow at each marker and change the animation
    bounds.extend(marker.position);

    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
      animateUponClick(this);
    });

  }
  map.fitBounds(bounds);
} // end InitMap

// Adds two bounces after clicking. = could be moved into separate function
// This is being called on line 87 within the loop for marker creation
function animateUponClick(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 1470);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
// Sample used and modified from the Udacity lectures
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time
    // to load.
    infowindow.setContent('');
    infowindow.marker = marker;

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was  found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        // infowindow.setContent('<div>' + marker.Subject + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.Subject + '</div>' + '<div>No Street View Found</div>');
      }
    }
  // Wikipedia API Ajax request - sampled from udacity lecture, need to add additional msg if there are no relevant wiki links to selected place.

    var  wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.Subject + '&format=json&callback=wikiCallback';
    $.ajax(wikiURL,{
      dataType: "jsonp",
      data: {
        async: true
      }
    }).done(function(response) {
      var  articleStr = response[1];
      var  URL = 'http://en.wikipedia.org/wiki/' + articleStr;
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.setContent('<div>' +
        '<h2>' + marker.Subject + '</h2>' + '</div><br><a href ="' + URL + '">' + URL + '</a><hr><div id="pano"></div>');
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }).fail(function(jqXHR, textStatus) {
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.setContent('<div>' +
        '<h4>' + marker.Subject + '</h4>' + '</div><br><p>Sorry. We could not contact Wikipedia! </p><hr><div id="pano"></div>');
        infowindow.open(map, marker);
    });

  }

} //end populateInfoWindow
var googleError = function() {
  //Use DOM or Alert? Can both but Alert seems more disruptive.
  // alert('Sorry! Try again later!');
  rt.mapError(true);
};
