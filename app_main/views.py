from django.shortcuts import render
from django.http import JsonResponse
from .models import *

# Home view remains the same
def home(request):
    return render(request, 'app_main/home.html')

# View for fetching provinces
def get_provinces(request):
    provinces = Province.objects.all().values('province_name')
    return JsonResponse(list(provinces), safe=False)

# View for fetching districts based on province_name (not province_id)
def get_districts(request):
    province_name = request.GET.get('province_name')
    districts = District.objects.filter(province_id=province_name).values('district_name')  # Filter using province_name
    print(districts)
    return JsonResponse(list(districts), safe=False)

# View for fetching municipalities based on district_name (not district_id)
def get_municipalities(request):
    district_name = request.GET.get('district_name')  # Use district_name in the GET request
    municipalities = Local_unit.objects.filter(district_id=district_name).values('name')  # Filter using district_name
    return JsonResponse(list(municipalities), safe=False)

def search_results(request):
    province_name = request.GET.get('province')
    district_name = request.GET.get('district')
    municipality_name = request.GET.get('municipality')

    results = None
    result_type = None  # <-- to track what kind of data we are returning

    if municipality_name:
        results = Local_unit.objects.filter(pk=municipality_name)
        result_type = 'local_unit'
    elif district_name:
        results = District.objects.filter(pk=district_name)
        result_type = 'district'
    elif province_name:
        results = Province.objects.filter(pk=province_name)
        result_type = 'province'

    provinces = Province.objects.all()
    districts = District.objects.all()
    municipalities = Local_unit.objects.all()

    context = {
        'results': results,
        'result_type': result_type,  # <-- pass it to the template
        'provinces': provinces,
        'districts': districts,
        'municipalities': municipalities,
    }
    return render(request, 'app_main/home.html', context)

def candidate_list_ajax(request):
    local_unit_name = request.GET.get('local_unit')
    ward_number = request.GET.get('ward')

    # Fetch the local_unit using the name
    local_unit = Local_unit.objects.get(name=local_unit_name)

    # Filter candidates by local_unit and ward
    candidates = Candidate.objects.filter(local_unit=local_unit, ward=ward_number)
    print(candidates)
    # Prepare the candidate data for rendering
    candidate_data = []
    for candidate in candidates:
        candidate_data.append({
            'name': candidate.name,
            'photo': candidate.photo.url,
            'party': candidate.party.party_name,
            'position': candidate.position,
            'vote': candidate.vote
        })

    # Return a JSON response with the candidate data
    return JsonResponse({'candidates': candidate_data})