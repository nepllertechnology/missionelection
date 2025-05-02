//for the local election 2079 json files
function loadSummaryData(jsonPath, targetTableSelector) {
  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector(targetTableSelector);
      if (!tbody) return;

      tbody.innerHTML = ""; // Clear current content

      data.forEach((entry) => {
        const row = document.createElement("tr");
        row.classList.add("border-b");

        row.innerHTML = `
          <td class="py-2">
            <div class="flex items-center space-x-2">
              <img src="${entry.icon}" alt="${entry.party}" class="party-icon">
              <span>${entry.party}</span>
            </div>
            <div class="w-40 h-2 bg-gray-200 rounded mt-1">
              <div class="h-2 rounded" style="width: ${entry.lead}; background-color: ${entry.barColor};"></div>
            </div>
            <div class="progress-wrapper">
              <div class="progress-fill" style="width: ${entry.lead}; background-color: ${entry.barColor};"></div>
            </div>
          </td>
          <td class="py-2">${entry.win}</td>
          <td class="py-2">0</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => console.error(`Error loading ${jsonPath}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  // Load Mayor & Deputy data
  loadSummaryData(
    "/static/data/mayor-summary.json",
    ".summary-card:nth-of-type(1) tbody"
  );
  loadSummaryData(
    "/static/data/deputy-mayor-summary.json",
    ".summary-card:nth-of-type(2) tbody"
  );
});

//for provincial results
function loadProvinceResults(jsonPath) {
  fetch(jsonPath)
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
  loadSummaryData(
    "/static/data/mayor-summary.json",
    ".summary-card:nth-of-type(1) tbody"
  );
  loadSummaryData(
    "/static/data/deputy-mayor-summary.json",
    ".summary-card:nth-of-type(2) tbody"
  );
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
