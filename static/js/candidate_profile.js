document.addEventListener("DOMContentLoaded", () => {
  // Utility: Get ID from query string
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const candidateId = getQueryParam("id");
  if (!candidateId) {
    alert("Candidate ID not found.");
    return;
  }

  fetch(`/api/candidate/${candidateId}/`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Candidate not found.");
      }
      return res.json();
    })
    .then((candidate) => {
      // Populate HTML with candidate data
      document.querySelector(".candprofile-party-icon").src = candidate.party_icon;
      document.querySelector(".candprofile-party-icon").alt = candidate.party;

      document.querySelector(".candprofile-name").textContent = candidate.name;
      document.querySelector(".candprofile-photo").src = candidate.photo;
      document.querySelector(".candprofile-photo").alt = candidate.name;

      document.querySelector(".candprofile-personal").innerHTML = `
        <p><strong>उमेर:</strong> ${candidate.age}</p>
        <p><strong>लिङ्ग:</strong> ${candidate.gender}</p>
        <p><strong>ठेगाना:</strong> ${candidate.address}</p>
      `;

      if (candidate.is_winner) {
        document.querySelector(".candprofile-right").insertAdjacentHTML(
          "afterbegin",
          '<div class="candetail-winner">विजयी</div>'
        );
      }

      document.querySelector(".candprofile-meta").innerHTML = `
        <p><strong>कुल मत:</strong> ${candidate.votes.toLocaleString()}</p>
        <p><strong>निर्वाचन क्षेत्र:</strong> ${candidate.constituency}</p>
        <p><strong>पार्टी:</strong> ${candidate.party}</p>
        <p><strong>शिक्षा:</strong> ${candidate.education}</p>
      `;
    })
    .catch((err) => {
      console.error("Error loading candidate profile:", err);
      alert("Error loading candidate profile.");
    });
});
