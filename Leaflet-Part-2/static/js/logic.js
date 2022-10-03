// Store query API endpoint - this is all 4.5+ magnitude earthquakes in the last 30 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
let geojson;



// Perform GET request
d3.json(queryUrl).then(function(data) {
    console.log("My data", data.features[0].geometry);
    let x = data.features
    createFeatures(x);
    console.log(x.length)
    

});

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>
        <hr><p>Earthquake Magnitude: ${feature.properties.mag}</p>
        <hr><p>Earthquake Depth: ${feature.geometry.coordinates[2]}</p>`)     
    }
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                color: chooseColor(feature.geometry.coordinates[2]),
                radius: feature.properties.mag*feature.properties.mag,
                fillOpacity: 0.75,
                weight: 2,
                fillColor: chooseColor(feature.geometry.coordinates[2])
            })
        }        
    });

    createMap(earthquakes);
    
}


function chooseColor(depth) { 
    if (depth > 90) return'#b30000';
    else if (depth > 70) return '#e34a33';
    else if (depth > 50) return '#fc8d59';
    else if (depth > 30) return '#fdbb84';
    else if (depth > 10) return '#fdd49e';
    else if (depth > 0) return 'lightgreen';
    else return "white"   
};

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
    
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
    
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);
  let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0,10,30,50,70,90];
    let labels = [];
    let from, to;

    for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push('<i style="background:' + chooseColor(from + 1) + '"></i>' + from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;

}

legend.addTo(myMap);

}

