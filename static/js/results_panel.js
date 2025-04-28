// This script renders the "प्रमुख/अध्यक्ष" and "उपप्रमुख/उपाध्यक्ष" panels
// It expects two <tbody> elements with IDs "chief-list" and "deputy-list"

const electionData = {
  chief: [
    {
      party: "Nepali Congress",
      votes: 327,
      seats: 0,
      icon: window.ICON_BASE_URL + "nc.png",
    },
    {
      party: "CPN-UML",
      votes: 207,
      seats: 0,
      icon: window.ICON_BASE_URL + "uml.png",
    },
    {
      party: "CPN (Maoist Center)",
      votes: 122,
      seats: 0,
      icon: window.ICON_BASE_URL + "maoist.png",
    },
    {
      party: "Others",
      votes: 39,
      seats: 0,
      icon: window.ICON_BASE_URL + "other.png",
    },
  ],
  deputy: [
    {
      party: "Nepali Congress",
      votes: 298,
      seats: 0,
      icon: window.ICON_BASE_URL + "nc.png",
    },
    {
      party: "CPN-UML",
      votes: 243,
      seats: 0,
      icon: window.ICON_BASE_URL + "uml.png",
    },
    {
      party: "CPN (Maoist Center)",
      votes: 127,
      seats: 0,
      icon: window.ICON_BASE_URL + "maoist.png",
    },
    {
      party: "Janata Samajwadi Party",
      votes: 39,
      seats: 0,
      icon: window.ICON_BASE_URL + "jsp.png",
    },
  ],
};

function renderList(listId, items) {
  const tbody = document.getElementById(listId);
  if (!tbody) return;

  const maxVotes = Math.max(...items.map((i) => i.votes));

  items.forEach((item) => {
    const tr = document.createElement("tr");

    // --- Party Cell ---
    const partyCell = document.createElement("td");

    const partyTop = document.createElement("div");
    partyTop.className = "party-top";

    const partyIcon = document.createElement("img");
    partyIcon.className = "party-icon";
    partyIcon.src = item.icon;
    partyIcon.alt = item.party;

    const partyName = document.createElement("span");
    partyName.className = "party-name";
    partyName.textContent = item.party;

    partyTop.appendChild(partyIcon);
    partyTop.appendChild(partyName);

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = (item.votes / maxVotes) * 100 + "%";
    progressFill.setAttribute("data-party", item.party);
    progressBar.appendChild(progressFill);

    partyCell.appendChild(partyTop);
    partyCell.appendChild(progressBar);

    tr.appendChild(partyCell);

    // --- Win Cell (Votes) ---
    const winCell = document.createElement("td");
    winCell.textContent = item.votes;
    tr.appendChild(winCell);

    // --- Lead Cell (Seats) ---
    const leadCell = document.createElement("td");
    leadCell.textContent = item.seats;
    tr.appendChild(leadCell);

    tbody.appendChild(tr);
  });
}

// Render on page load
renderList("chief-list", electionData.chief);
renderList("deputy-list", electionData.deputy);
