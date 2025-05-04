// Create the map
var map = L.map("map", {
  center: [28.3949, 84.124],
  zoom: 7,
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  attributionControl: false,
});
map.setView([28.3949, 84.1240], 7.2);

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

let districtElectionData = {};  // Empty object to fill later

fetch("/static/data/district_result.json")  // Load JSON from static
  .then(response => response.json())
  .then(data => {
    districtElectionData = data;
  });


//  Create a floating info box
const infoBox = L.DomUtil.create("div", "district-info-box");
document.body.appendChild(infoBox);


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

            // Interactivity
            layer.on({
              mouseover: function (e) {
                const districtName = feature.properties.DIST_EN;
                const data = districtElectionData[districtName];

                if (data) {
                  const htmlContent = `
                    <strong>${districtName}</strong>
                    <table>
                      <thead>
                        <tr><th>Mayor / Chairperson</th><th>Win / Lead</th></tr>
                      </thead>
                      <tbody>
                        ${Object.entries(data).map(([party, result]) => `
                          <tr>
                            <td>
                              <img src="/static/icons/${party.toLowerCase().replace(/\s+/g, "-")}.png" class="party-icon" />
                              ${party}
                            </td>
                            <td>${result.win} / ${result.lead}</td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  `;
                  infoBox.innerHTML = htmlContent;
                  infoBox.style.display = "block";
                }

                e.target.setStyle({
                  weight: 2,
                  color: "#FF5733",
                  fillOpacity: 0.1,
                });
              },
              mousemove: function (e) {
                infoBox.style.left = e.originalEvent.pageX + 15 + "px";
                infoBox.style.top = e.originalEvent.pageY - 10 + "px";
              },
              mouseout: function (e) {
                districtLayer.resetStyle(e.target);
                infoBox.style.display = "none";
              },
              click: function (e) {
                alert("District: " + feature.properties.DIST_EN);
              },
            });
          },
        }).addTo(map);
      });
  });


////////////////////////////////////////
// for minimap 
///////////////////////////////////////

// This function generates a color based on the hash of the name
function getRandomColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 70%)`; // pastel-like HSL colors
}


// Create the municipality map for one district (Bhaktapur)
var muniMap = L.map("muni-map", {
  center: [27.67, 85.43],       // Approx center of Bhaktapur
  zoom: 12,
  zoomControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  attributionControl: false
});

// Load municipalities GeoJSON and filter for Kathmandu district
fetch("/static/geojson/nepal_municipalities.geojson")
  .then(response => response.json())
  .then(data => {
    const kathmanduFeatures = data.features.filter(
      f => f.properties.DISTRICT === "Kathmandu"
    );

    const muniLayer = L.geoJson(kathmanduFeatures, {
      style: function (feature) {
        const name = feature.properties.NAME;
        return {
          color: "#333",
          weight: 1,
          fillOpacity: 0.6,
          fillColor: getRandomColorFromName(name),
        };
      },
      onEachFeature: function (feature, layer) {
        layer.bindTooltip(feature.properties.NAME, {
          permanent: true,
          direction: "center",
          className: "district-label",
        });
        layer.on({
          mouseover: function (e) {
            e.target.setStyle({
              weight: 2,
              color: "#FF5733",
              fillOpacity: 0.9,
            });
          },
          mouseout: function (e) {
            muniLayer.resetStyle(e.target);
          },
          click: function (e) {
            alert("You clicked on: " + feature.properties.NAME);
          },
        });
      }
    }).addTo(muniMap);
    // Auto-zoom to the Kathmandu municipalities
    muniMap.fitBounds(muniLayer.getBounds());
  });




//for provincial results
function loadProvinceResults(jsonPath) {
  fetch('/pichart')
    .then((res) => res.json())
    .then((provinces) => {
      const container = document.getElementById("province-container");
      container.innerHTML = "";

      provinces.forEach(({ province, chartId, results }) => {
        const card = document.createElement("div");
        card.className = "province-card";

        const title = document.createElement("div");
        title.className = "province-title";
        title.textContent = province;

        const chartContainer = document.createElement("div");
        chartContainer.className = "chart-container";
        const canvas = document.createElement("canvas");
        canvas.id = chartId;
        chartContainer.appendChild(canvas);

        const table = document.createElement("table");
        table.innerHTML = `
          <thead>
            <tr>
              <th>Party</th>
              <th>Win</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");
        results.forEach(({ party, win, color }) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td><span class="legend-color" style="background:${color};"></span>${party}</td>
            <td>${win}</td>
          `;
          tbody.appendChild(row);
        });

        // Assemble the card
        card.appendChild(title);
        card.appendChild(chartContainer);
        card.appendChild(table);
        container.appendChild(card);

        // Create chart
        const labels = results.map((r) => r.party);
        const data = results.map((r) => r.win);
        const colors = results.map((r) => r.color);
        createPieChart(chartId, labels, data, colors);
      });
    })
    .catch((err) => console.error("Province results load error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadProvinceResults("/static/data/province-results.json");
});

//pie chart portion
function createPieChart(id, labels, data, colors) {
  new Chart(document.getElementById(id), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
          },
        },
      },
      cutout: "60%",
    },
  });
}