async function loadDistricts() {
    const provinceSelect = document.getElementById('province');
    const provinceName=provinceSelect.value;
    const districtSelect = document.getElementById('district');
    const municipalitySelect = document.getElementById('municipality');

    // Clear previous options
    districtSelect.innerHTML = '<option selected disabled>Choose District</option>';
    municipalitySelect.innerHTML = '<option selected disabled>Choose Municipality</option>';

    const response = await fetch(`/api/districts/?province_name=${encodeURIComponent(provinceName)}`);
    const districts = await response.json();


    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.district_name;
        option.textContent = district.district_name;
        districtSelect.appendChild(option);
    });
}

async function loadMunicipalities() {
    const districtSelect = document.getElementById('district');
    const districtName=districtSelect.value
    const municipalitySelect = document.getElementById('municipality');

    // Clear previous options
    municipalitySelect.innerHTML = '<option selected disabled>Choose Municipality</option>';

    const response = await fetch(`/api/municipalities/?district_name=${encodeURIComponent(districtName)}`);
    const municipalities = await response.json();

    municipalities.forEach(municipality => {
        const option = document.createElement('option');
        option.value = municipality.name;
        option.textContent = municipality.name;
        municipalitySelect.appendChild(option);
    });
}

// You can also load provinces on page load
document.addEventListener('DOMContentLoaded', async () => {
    const provinceSelect = document.getElementById('province');
    const response = await fetch('/api/provinces/');
    const provinces = await response.json();

    provinces.forEach(province => {
        const option = document.createElement('option');
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

    fetch(`/candidate_list_ajax/?local_unit=${encodeURIComponent(localUnit)}&ward=${encodeURIComponent(ward)}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(`candidate-results-${unitId}`);
            container.innerHTML = ''; // Clear previous results

            if (!data.candidates.length) {
                container.innerHTML = '<p>No candidates found.</p>';
                return;
            }

            data.candidates.forEach(candidate => {
                const card = document.createElement('div');
              
                card.className = 'candidate-card';
                card.innerHTML = `
                    <img src="${candidate.photo}" alt="${candidate.name}">
                    <div class="candidate-info">
                        <h4>${candidate.name}</h4>
                        <p><strong>Party:</strong> ${candidate.party}</p>
                        <p><strong>Position:</strong> ${candidate.position}</p>
                        <p><strong>Votes:</strong> ${candidate.vote}</p>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching candidates:", error);
        })};