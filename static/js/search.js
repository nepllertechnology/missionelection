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

//for the selected municipalities mayor/deputy mayor results
async function loadMayoralResults(unitName) {
  
  try {
    const response = await fetch(`/api/unit_results/?municipality=${encodeURIComponent(unitName)}`);
const data = await response.json();
console.log(data);

// FIXED HERE:
const results = data.results;
console.log(results);

const resultContainer = document.getElementById("mayoral-results-2079");
resultContainer.innerHTML = ""; // Clear previous results

const normalizedUnitName = unitName
  .replace(/ (Metropolitan City|Sub-Metropolitan City|Municipality|Rural Municipality)$/i, "")
  .trim()
  .toLowerCase();

// Since `results` is an array, you can `.find` over it:
const unitData = results.find(
  (r) => r.local_unit.trim().toLowerCase() === normalizedUnitName
);

if (!unitData) {
  resultContainer.innerHTML = "<p>No mayoral data available for this unit.</p>";
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
    const [left, right] = candidates.slice(0, 2);
    const totalVotes = left.votes + right.votes;

    const card = document.createElement("div");
    card.className = "mayorcard";

    // Title
    const heading = document.createElement("h4");
    heading.textContent = title;
    card.appendChild(heading);

    // Candidate row
    const row = document.createElement("div");
    row.className = "mayorcard-row";

    [left, right].forEach((candidate, index) => {
      const alignment = index === 0 ? "left" : "right";

      const candidateDiv = document.createElement("div");
      candidateDiv.className = `mayorcard-candidate ${alignment}`;

      const topRow = document.createElement("div");
      topRow.className = `mayorcard-top ${alignment}`;

      const img = document.createElement("img");
      img.className = "mayorcard-photo";
      img.src =
        window.location.origin +
        (candidate.photo || "/static/icons/default.png");
      img.alt = candidate.name;

      const nameEl = document.createElement("div");
      nameEl.className = "mayorcard-name";
      nameEl.textContent = candidate.name;

      const partyEl = document.createElement("div");
      partyEl.className = "mayorcard-partyname";
      partyEl.textContent = candidate.party;

      const candidateInfo = document.createElement("div");
      candidateInfo.className = "mayorcard-info";
      candidateInfo.append(nameEl, partyEl);

      if (alignment === "right") {
        topRow.append(candidateInfo, img);
      } else {
        topRow.append(img, candidateInfo);
      }

      candidateDiv.appendChild(topRow);
      row.appendChild(candidateDiv);
    });

    card.appendChild(row);

    // Progress Bar (split style with dynamic widths and colors)
    const progressSplit = document.createElement("div");
    progressSplit.className = "mayorcard-progress-split";

    const leftSegment = document.createElement("div");
    leftSegment.className = "segment-left";
    leftSegment.style.width = `${(left.votes / totalVotes) * 100}%`;
    leftSegment.style.backgroundColor = left.color || "#2e86de";
    leftSegment.textContent = left.votes.toLocaleString();

    const rightSegment = document.createElement("div");
    rightSegment.className = "segment-right";
    rightSegment.style.width = `${(right.votes / totalVotes) * 100}%`;
    rightSegment.style.backgroundColor = right.color || "#e74c3c";
    rightSegment.textContent = right.votes.toLocaleString();

    progressSplit.append(leftSegment, rightSegment);
    card.appendChild(progressSplit);

    // Footer Row
    const footerRow = document.createElement("div");
    footerRow.className = "mayorcard-bottom";

    [left, right].forEach((candidate, index) => {
      const footer = document.createElement("div");
      footer.className = "mayorcard-footer";

      const icon = document.createElement("img");
      icon.className = "mayorcard-party-icon";
      icon.src =
        window.location.origin +
        (candidate.party_icon || "/static/icons/nc.png");
      icon.alt = candidate.party;

      const votes = document.createElement("span");
      votes.className = "mayorcard-votes";
      votes.textContent = candidate.votes.toLocaleString();

      const voteRow = document.createElement("div");
      voteRow.className = "mayorcard-vote-row";
      voteRow.append(icon, votes);

      footer.appendChild(voteRow);

      if (index === 0) {
        const label = document.createElement("span");
        label.className = "mayorcard-elected-label";
        label.textContent = "Elected";
        footer.appendChild(label);
      }

      footerRow.appendChild(footer);
    });

    card.appendChild(footerRow);

    return card;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const municipalitySelect = document.getElementById("municipality");
  loadMayoralResults( municipalitySelect.value); //for now, to fetch this data from mock json
});

// Ward section
document.addEventListener("DOMContentLoaded", () => {
  const unitName = document.getElementById("municipality").value;
  fetch(`/api/ward_result/?municipality=${encodeURIComponent(unitName)}`)
    .then((response) => response.json())
    .then((data) => {
      const wardSelect = document.getElementById("ward-select");
      const container = document.getElementById("ward-results-container");

      // Function to populate ward dropdown
      function populateWardDropdown(wards) {
        wardSelect.innerHTML = ""; // Clear previous options
        wards.forEach((ward) => {
          const option = document.createElement("option");
          option.value = ward.ward_number;
          option.textContent = `Ward ${ward.ward_number}`;
          wardSelect.appendChild(option);
        });
      }

      // Populate the dropdown and total ward count
      populateWardDropdown(data.wards);
      document.getElementById(
        "total-wards"
      ).textContent = `Total Wards: ${data.wards.length}`;

      // Function to render ward results
      function renderWardResults(wardNumber) {
        const wardData = data.wards.find((w) => w.ward_number == wardNumber);
        container.innerHTML = ""; // Clear previous results

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
            // Add "Elected" badge if applicable
            if (candidate.elected) {
              const badge = document.createElement("div");
              badge.className = "mayorcard-elected-label ";
              badge.textContent = "Elected";
              card.appendChild(badge);
            }
          });

          row.appendChild(col);
        });

        container.appendChild(row);
      }

      // Initial load with first ward
      renderWardResults(data.wards[0].ward_number);

      // Change handler for dropdown
      wardSelect.addEventListener("change", (e) => {
        console.log("Selected")
        renderWardResults(e.target.value);
      });
    });
});
