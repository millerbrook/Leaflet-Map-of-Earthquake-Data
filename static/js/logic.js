// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  
  // Once we get a response, send the data.features object to the createFeatures function
  //console.log(data.features)
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function calcColor(depth) {
    var depthColor = '#fabe6e'
    if (depth > 9.9) {
      depthColor = '#ceb863'
    }
    if (depth > 19.9) {
      depthColor = '#a4b061'
    }
    if (depth > 29.9) {
      depthColor = '#7da566'
    }
    if (depth > 39.9) {
      depthColor = '#5b986d'
    }
    if (depth > 49.9) {
      depthColor = '#3d8972'
    }
    if (depth >59.9) {
      depthColor = '#277a73'
    }
    if (depth > 69.9) {
      depthColor = '#1f696f'
    }
    if (depth > 79.9) {
      depthColor = '#245866'
    }
    if (depth > 89.9) {
      depthColor = '#2a4858'
    }
    return depthColor;
  };

  function calcRadius(magnitude) {
    var mag = 0;
    if (!magnitude) {
      mag =1;
    } else {
      mag = magnitude *4;
    }
    return mag;
  };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(earthquake, layer) {
     // console.log(earthquake)
      layer.bindPopup("<h3>" + earthquake.properties.place +
        "</h3><hr><p>" + new Date(earthquake.properties.time) + "</p>");
    }
  ,
    pointToLayer: function(earthquake,location){
      //console.log(earthquake)
      //console.log(location)
      return L.circleMarker(location)
    },
    style: function(earthquake) {
      return {
        color: '#1c1c1c',
        fillColor: calcColor(earthquake.geometry.coordinates[2]),
        opacity: 0,
        fillOpacity: .75,
        radius: calcRadius(earthquake.properties.mag)
      }
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

   // Create our map, giving it the streetmap and earthquakes layers to display on load
 var myMap = L.map("map", {
  center: [
    16.53, -23.04
  ],
  zoom: 2,
  layers: [streetmap, earthquakes]
});

  // Use this link to get the geojson data.
var link = "../static/data/tectonic.json";

// Grabbing our GeoJSON data..
d3.json(link).then(function(tectonicData) {
  // Creating a GeoJSON layer with the retrieved data
  var tectonic = L.geoJson(tectonicData).addTo(myMap);



  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tectonic: tectonic
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = ["<10", "<20", "<30", "<40", "<50", "<60", "<70", "<80", "<90", ">90"];
      var colors = ['#fabe6e','#ceb863', '#a4b061', '#7da566', '#5b986d', '#3d8972', '#277a73', '#1f696f', '#245866', '#2a4858'];
      var labels = [];
  
      // Add min & max
      var legendInfo = "<h3>Earthquake Depth (in feet)</h3>" +
        "<div class=\"labels\">" +
          "<div class=\"min\">" + limits[0] + "</div>" +
          "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";
  
      div.innerHTML = legendInfo;
  
      limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });
  
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      div.innerHTML += "<h3>Magnitude Scale (1 - 5):</h3>" + "<div class = 'radiiCircles'></div>";
      return div;
      
    };
    
    // Adding legend to the map
    legend.addTo(myMap);
    var svg = d3.select(".radiiCircles").append("svg");

      svg.attr("width", "100px").attr("height", "100px");
      
      // Part 2
      // Binding the SVG to data
      
      var circles = svg.selectAll("circle");
      
      var rValues = [20, 16, 12, 8, 4];
      
      circles.data(rValues)
          .enter()
          .append("circle")
          .attr("cy", function(d) {
            return d;
          })
          .attr("cx", 50)
          .attr("r", function(d) {
            return d;
          })
          .attr("stroke", "black")
          .attr("stroke-width", ".1")
          .attr("fill", function(d) {
              switch (d) {
                case 20: return '#ffffff';
                case 16: return '#c7ced3';
                case 12: return '#909fa8';
                case 8: return '#5d727f';
                case 4: return '#2a4858'
              };
          });
  });
}


