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
