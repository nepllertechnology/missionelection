document.addEventListener("DOMContentLoaded", () => {
  fetch("/static/data/all_candidate_details.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("candetail-container");

      data.forEach((group) => {
        // Create constituency card
        const card = document.createElement("div");
        card.className = "candetail-constituency-card";

        // Header
        const header = document.createElement("div");
        header.className = "candetail-constituency-header";
        header.innerHTML = `
          <span>${group.constituency}</span>
          <span>${group.district}</span>
        `;
        card.appendChild(header);

        // Candidates
        group.candidates.forEach((cand) => {
          const row = document.createElement("div");
          row.className = "candetail-candidate";

          row.innerHTML = `
            <img class="candetail-photo" src="${cand.photo}" alt="${cand.name}">
            <div class="candetail-info">
              <div class="candetail-name">${cand.name}
                
              </div>
              <div class="candetail-party">
                <img class="candetail-party-icon" src="${
                  cand.party_icon
                }" alt="${cand.party}">
                <span>${cand.party}</span>
              </div>
               ${
                 cand.is_winner
                   ? '<span class="candetail-winner">विजयी</span>'
                   : ""
               }
            </div>
            <div class="candetail-votes">${cand.votes.toLocaleString()}</div>
          `;

          card.appendChild(row);
        });

        // Optional: "Full Details" button
        const btn = document.createElement("button");
        btn.className = "candetail-details-btn";
        btn.textContent = "FULL DETAILS";
        card.appendChild(btn);

        // Add to page
        container.appendChild(card);
      });
    })
    .catch((err) => console.error("Failed to load candidate details:", err));
});
