async function loadDistricts() {
  const provinceSelect = document.getElementById("province");
  const provinceName = provinceSelect.value;
  const districtSelect = document.getElementById("district");
  const municipalitySelect = document.getElementById("municipality");

  // Clear previous options
  districtSelect.innerHTML =
    "<option selected disabled>Choose District</option>";
  municipalitySelect.innerHTML =
    "<option selected disabled>Choose Municipality</option>";

  const response = await fetch(
    `/api/districts/?province_name=${encodeURIComponent(provinceName)}`
  );
  const districts = await response.json();

  districts.forEach((district) => {
    const option = document.createElement("option");
    option.value = district.district_name;
    option.textContent = district.district_name;
    districtSelect.appendChild(option);
  });
}

async function loadMunicipalities() {
  const districtSelect = document.getElementById("district");
  const districtName = districtSelect.value;
  const municipalitySelect = document.getElementById("municipality");

  // Clear previous options
  municipalitySelect.innerHTML =
    "<option selected disabled>Choose Municipality</option>";

  const response = await fetch(
    `/api/municipalities/?district_name=${encodeURIComponent(districtName)}`
  );
  const municipalities = await response.json();

  municipalities.forEach((municipality) => {
    const option = document.createElement("option");
    option.value = municipality.name;
    option.textContent = municipality.name;
    municipalitySelect.appendChild(option);
  });
}

// You can also load provinces on page load
document.addEventListener("DOMContentLoaded", async () => {
  const provinceSelect = document.getElementById("province");
  const response = await fetch("/api/provinces/");
  const provinces = await response.json();

  provinces.forEach((province) => {
    const option = document.createElement("option");
    option.value = province.province_name;
    option.textContent = province.province_name;
    provinceSelect.appendChild(option);
  });
});

function loadCandidates(unitId) {
  const form = document.getElementById(`ward-form-${unitId}`);
  const formData = new FormData(form);
  const localUnit = formData.get("local_unit");
  const ward = formData.get("ward");

  fetch(
    `/candidate_list_ajax/?local_unit=${encodeURIComponent(
      localUnit
    )}&ward=${encodeURIComponent(ward)}`
  )
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById(`candidate-results-${unitId}`);
      container.innerHTML = "";

      const grouped = data.grouped_candidates;

      if (Object.keys(grouped).length === 0) {
        container.innerHTML = "<p>No candidates found.</p>";
        return;
      }

      // Loop through each position category
      for (let position in grouped) {
        const card = document.createElement("div");
        card.className = "position-card";
        card.innerHTML = `
                    <h3>${position}</h3>
                    <div class="candidates-list"></div>
                `;

        const candidatesList = card.querySelector(".candidates-list");

        // Loop through candidates and add them to the position card
        grouped[position].forEach((candidate, index) => {
          const candidateItem = document.createElement("div");
          candidateItem.className = "candidate-item";
          candidateItem.innerHTML = `
                        <div class="rank">#${index + 1}</div>
                        <img src="${candidate.photo}" alt="${candidate.name}" />
                        <div class="candidate-info">
                            <h4>${candidate.name}</h4>
                            <p><strong>Party:</strong> ${candidate.party}</p>
                            <p><strong>Votes:</strong> ${candidate.vote}</p>
                        </div>
                    `;
          candidatesList.appendChild(candidateItem);
        });

        container.appendChild(card);
      }
    })
    .catch((error) => {
      console.error("Error fetching candidates:", error);
    });
}

//for the selected municipalities mayor/deputy mayor results
async function loadMayoralResults(unitName) {
  try {
    const response = await fetch("/static/data/mayoral_results_mock.json");
    const data = await response.json();

    const results = data.results;
    const resultContainer = document.getElementById("mayoral-results-2079");
    resultContainer.innerHTML = ""; // Clear previous results

    const normalizedUnitName = unitName
      .replace(" Municipality", "")
      .trim()
      .toLowerCase();

    const unitData = results.find(
      (r) => r.local_unit.trim().toLowerCase() === normalizedUnitName
    );

    if (!unitData) {
      resultContainer.innerHTML =
        "<p>No mayoral data available for this unit.</p>";
      return;
    }

    // Remove any previously inserted header
    const existingHeader = document.querySelector(".mayoral-header-box");
    if (existingHeader) {
      existingHeader.remove();
    }

    // Add heading above cards
    const header = document.createElement("div");
    header.className = "mayoral-header-box";
    header.innerHTML = `<h3>${unitData.local_unit} ${unitData.type}</h3>`;
    resultContainer.parentNode.insertBefore(header, resultContainer);

    // Generate dynamic summary for available positions (mayor, chairperson, etc.)
    const summaryContainer = document.getElementById("mayoral-summary-text");
    let summaryText = "";

    const positionPriority = ["mayor", "chairperson"]; // prioritize mayoral/lead roles
    for (const key of positionPriority) {
      const candidates = unitData[key];
      if (candidates && candidates.length >= 2) {
        const [winner, runnerUp] = candidates;
        const margin = winner.votes - runnerUp.votes;
        const positionLabel =
          key === "mayor"
            ? "Mayor"
            : key === "chairperson"
            ? "Chairperson"
            : key;

        summaryText = `${winner.name} from ${
          winner.party
        } is leading as ${positionLabel} of ${unitData.local_unit} ${
          unitData.type
        } by ${margin.toLocaleString()} votes.`;
        break;
      }
    }

    if (!summaryText) {
      summaryText = "No summary data available for this unit.";
    }

    summaryContainer.innerHTML = `<p>${summaryText}</p>`;

    // Render candidate groups
    const excludedKeys = ["local_unit", "type", "summary"];
    Object.entries(unitData).forEach(([key, candidates]) => {
      if (excludedKeys.includes(key)) return;

      const positionTitle = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      // Sort candidates by vote count descending
      candidates.sort((a, b) => b.votes - a.votes);

      const card = renderCandidateGroup(positionTitle, candidates);
      resultContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load mayoral results:", error);
    const resultContainer = document.getElementById("mayoral-results-2079");
    resultContainer.innerHTML = "<p>Error loading mayoral results.</p>";
  }

  function renderCandidateGroup(title, candidates) {
    const groupCard = document.createElement("div");
    groupCard.className = "mayoral-position-card";
    groupCard.innerHTML = `<h4>${title}</h4><div class="mayoral-candidates-list"></div>`;

    const listContainer = groupCard.querySelector(".mayoral-candidates-list");

    candidates.forEach((candidate) => {
      const photoPath = candidate.photo || "/static/icons/default.png";
      const item = document.createElement("div");
      item.className = "mayoral-candidate-item";
      item.innerHTML = `
        <img src="${window.location.origin + photoPath}" alt="${
        candidate.name
      } - ${candidate.party}" />
        <div class="mayoral-candidate-info">
          <h5>${candidate.name}</h5>
          <p><strong>Party:</strong> ${candidate.party}</p>
          <p><strong>Votes:</strong> ${candidate.votes.toLocaleString()} (${
        candidate.vote_percent
      }%)</p>
        </div>
      `;
      listContainer.appendChild(item);
    });

    return groupCard;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadMayoralResults("Tarakeshwor"); //for now, only this data in mock json
});

//Ward section
document.addEventListener("DOMContentLoaded", () => {
  fetch("/static/data/ward_results.json")
    .then((response) => response.json())
    .then((data) => {
      const wardSelect = document.getElementById("ward-select");
      const container = document.getElementById("ward-results-container");

      // Populate ward dropdown
      data.wards.forEach((ward) => {
        const option = document.createElement("option");
        option.value = ward.ward_number;
        option.textContent = `Ward ${ward.ward_number}`;
        wardSelect.appendChild(option);
      });
      const totalWards = data.wards.length;
      document.getElementById(
        "total-wards"
      ).textContent = `Total Wards: ${totalWards}`;

      const renderWardResults = (wardNumber) => {
        const wardData = data.wards.find((w) => w.ward_number == wardNumber);
        container.innerHTML = ""; // Clear previous

        const row = document.createElement("div");
        row.className = "ward-results-row";

        Object.entries(wardData.results).forEach(([position, candidates]) => {
          const col = document.createElement("div");
          col.className = "ward-position-column";

          const header = document.createElement("h5");
          header.textContent = position;
          col.appendChild(header);

          candidates.forEach((candidate) => {
            const card = document.createElement("div");
            card.className = `ward-candidate-card ${
              candidate.elected ? "elected" : ""
            }`;
            const header = document.createElement("div");
            header.className = "ward-candidate-header";

            const nameSpan = document.createElement("span");
            nameSpan.className = "ward-candidate-name";

            if (candidate.icon) {
              const icon = document.createElement("img");
              icon.src = candidate.icon;
              icon.alt = candidate.symbol || "";
              icon.className = "ward-party-icon";
              nameSpan.appendChild(icon);
            }

            nameSpan.appendChild(document.createTextNode(candidate.name));

            const votesSpan = document.createElement("span");
            votesSpan.className = "ward-candidate-votes";
            votesSpan.textContent = candidate.votes.toLocaleString();

            header.appendChild(nameSpan);
            header.appendChild(votesSpan);

            const partyDiv = document.createElement("div");
            partyDiv.className = "ward-candidate-party";
            partyDiv.textContent = candidate.party;

            card.appendChild(header);
            card.appendChild(partyDiv);
            col.appendChild(card);
          });

          row.appendChild(col);
        });

        container.appendChild(row); // Add row to container
      };

      // Initial load
      renderWardResults(data.wards[0].ward_number);

      // On change
      wardSelect.addEventListener("change", (e) => {
        renderWardResults(e.target.value);
      });
    });
});
