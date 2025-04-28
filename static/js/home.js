// Create the map centered at Nepal with fixed zoom
var map = L.map('map', {
    center: [28.3949, 84.1240], // Center of Nepal
    zoom: 7,                   // Good zoom level for full Nepal
    zoomControl: false,         // Disable zoom buttons (+/-)
    dragging: false,            // Disable dragging
    scrollWheelZoom: false,     // Disable scroll zoom
    doubleClickZoom: false,     // Disable double-click zoom
    boxZoom: false,             // Disable box zoom
    keyboard: false,            // Disable keyboard zoom/move
    attributionControl: false   // Hide attribution
});

// Load GeoJSON
fetch("/static/geojson/nepal_districts_new.geojson")
    .then(response => response.json())
    .then(data => {

        var geojsonLayer = L.geoJson(data, {
            style: {
                color: "#3388ff",
                weight: 1,
                fillOpacity: 0.4
            },
            onEachFeature: function (feature, layer) {
                layer.bindTooltip(feature.properties.DIST_EN, {
                    permanent: true,
                    direction: "center",
                    className: "district-label"
                });
                layer.on({
                    mouseover: function (e) {
                        e.target.setStyle({
                            weight: 2,
                            color: '#FF5733',
                            fillOpacity: 0.7
                        });
                    },
                    mouseout: function (e) {
                        geojsonLayer.resetStyle(e.target);
                    },
                    click: function (e) {
                        alert("You clicked on: " + feature.properties.DIST_EN);
                    }
                });
            }
        }).addTo(map);

    });
