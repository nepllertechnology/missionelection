from django.shortcuts import render
from django.http import JsonResponse
from app_main.utils import metroAndsubmetro,partyResult
from app_main.utils import metroAndsubmetro,partyResult,provinceResults
from collections import Counter,defaultdict

from .models import *
from collections import defaultdict
from django.shortcuts import redirect

# Home view remains the same
def home(request):
    context=metroAndsubmetro()
    mayorparty_count=partyResult('Mayor')
    Dmayorparty_count=partyResult('Deputy Mayor')   
    context['mayor_party_count']=mayorparty_count
    context['Dmayor_party_count']=Dmayorparty_count
    return render(request, 'home.html',context=context)

def province_Result(request):
    province_results = provinceResults()
    
    PARTY_COLORS = {
        "Nepali Congress": "#2e7d32",
        "CPN-UML": "#b71c1c",
        "Maoist Centre": "#e53935",
        "CPN (Unified Socialist)": "#f57c00",
        "Janata Samajwadi Party": "#ce93d8",
        "Loktantrik Samajwadi Party": "#90caf9",
        "Others": "#4dd0e1"
    }

    MAIN_PARTIES = set(PARTY_COLORS.keys()) - {"Others"}

    formatted_results = []

    for province_data in province_results:
        province_name = province_data['province']
        total_wins = province_data['total_party_wins']

        # Count wins per party
        party_win_map = {entry['party']: entry['wins'] for entry in total_wins}

        province_result = []
        other_wins = 0

        for party in MAIN_PARTIES:
            win = party_win_map.get(party, 0)
            if win > 0 or party in party_win_map:
                province_result.append({
                    "party": party,
                    "win": win,
                    "color": PARTY_COLORS[party]
                })

        for party_name, win in party_win_map.items():
            if party_name not in MAIN_PARTIES:
                other_wins += win

        province_result.append({
            "party": "Others",
            "win": other_wins,
            "color": PARTY_COLORS["Others"]
        })

        province_result.sort(key=lambda x: x["win"], reverse=True)

        chart_id = "chart" + province_name.replace(" ", "")
        formatted_results.append({
            "province": province_name,
            "chartId": chart_id,
            "results": province_result
        })

    return JsonResponse(formatted_results, safe=False)

# View for fetching provinces
def get_provinces(request):
    provinces = Province.objects.all().values('province_name')
    return JsonResponse(list(provinces), safe=False)

# View for fetching districts based on province_name (not province_id)
def get_districts(request):
    province_name = request.GET.get('province_name')
    districts = District.objects.filter(province_id=province_name).values('district_name')  # Filter using province_name
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
        'result_type': result_type,  
        'provinces': provinces,
        'districts': districts,
        'municipalities': municipalities,
    }
    return render(request, 'candidate.html', context)

def candidate_list_ajax(request):
    print("triggerr")
    local_unit_name = request.GET.get('local_unit')
    ward_number = request.GET.get('ward')

    try:
        local_unit = Local_unit.objects.get(name=local_unit_name)
    except Local_unit.DoesNotExist:
        return JsonResponse({'error': 'Local unit not found'}, status=404)

    candidates = Candidate.objects.filter(local_unit=local_unit, ward=ward_number).order_by('-vote')

    grouped_candidates = defaultdict(list)
    for candidate in candidates:
        grouped_candidates[candidate.position].append({
            'name': candidate.name,
            'photo': candidate.photo.url,
            'party': candidate.party.party_name,
            'position': candidate.position,
            'vote': candidate.vote,
        })

    return JsonResponse({'grouped_candidates': grouped_candidates})