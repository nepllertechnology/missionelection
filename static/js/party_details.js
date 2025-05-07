document.addEventListener("DOMContentLoaded", () => {
  fetch("/static/data/party_details.json")
    .then((res) => res.json())
    .then((parties) => {
      const grid = document.getElementById("partydetail-grid");

      parties.forEach((party) => {
        const card = document.createElement("div");
        card.className = "partydetail-card";

        card.innerHTML = `
          <img src="${party.logo}" alt="${party.name}" class="partydetail-logo">
          <div class="partydetail-name">${party.name}</div>
          <div class="partydetail-chair">अध्यक्ष: ${party.chairperson}</div>
          <div class="partydetail-votes">कुल मत: ${party.votes.toLocaleString()}</div>
        `;

        grid.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Failed to load party details:", err);
    });
});
