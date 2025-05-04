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
map.setView([28.3949, 84.124], 7.2);

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

//for provincial results
function loadProvinceResults(jsonPath) {
  fetch("/pichart")
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
