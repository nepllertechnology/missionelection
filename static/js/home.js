// Create the map
var map = L.map("map", {
  center: [28.3949, 84.124],
  zoom: 7,
  zoomControl: true,
  dragging: true,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  attributionControl: false,
});

// Color palette for provinces
var provinceColors = {
  1: "#ff9999",
  2: "#99ccff",
  3: "#99ff99",
  4: "#ffcc99",
  5: "#cc99ff",
  6: "#ffff99",
  7: "#ff99cc",
};

// Load Provinces First
fetch("/static/geojson/nepal_states.geojson")
  .then((response) => response.json())
  .then((provinceData) => {
    var provinceLayer = L.geoJson(provinceData, {
      style: function (feature) {
        return {
          color: "#333", // Border color
          weight: 1,
          fillColor: provinceColors[feature.properties.ADM1_EN], // Province Color
          fillOpacity: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.bindTooltip(feature.properties.ADM1_EN, {
          permanent: false,
          direction: "top",
          className: "province-label",
        });
      },
    }).addTo(map);

    // Now load Districts
    fetch("/static/geojson/nepal_districts_new.geojson")
      .then((response) => response.json())
      .then((districtData) => {
        var districtLayer = L.geoJson(districtData, {
          style: {
            color: "#666",
            weight: 1,
            fillOpacity: 0, // Transparent so province color is visible
          },
          onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties.DIST_EN, {
              permanent: true,
              direction: "center",
              className: "district-label",
            });

            layer.on({
              mouseover: function (e) {
                e.target.setStyle({
                  weight: 2,
                  color: "#FF5733",
                  fillOpacity: 0.1,
                });
              },
              mouseout: function (e) {
                districtLayer.resetStyle(e.target);
              },
              click: function (e) {
                alert("District: " + feature.properties.DIST_EN);
              },
            });
          },
        }).addTo(map);
      });
  });
