from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from app_main.utils import metroAndsubmetro,partyResult
from app_main.utils import metroAndsubmetro,partyResult,provinceResults
from collections import Counter,defaultdict
from django.db.models import Max
from .models import *
from collections import defaultdict
from django.shortcuts import redirect


PARTY_COLORS = {
        "Nepali Congress": "#2e7d32",
        "CPN-UML": "#b71c1c",
        "Maoist Centre": "#e53935",
        "CPN (Unified Socialist)": "#f57c00",
        "Janata Samajwadi Party": "#ce93d8",
        "Loktantrik Samajwadi Party": "#90caf9",
        "Others": "#4dd0e1",
        "Independent":"#4dd0e1"
    }
# Home view remains the same
def home(request):
    context=metroAndsubmetro()
    mayorparty_count=partyResult('Mayor')
    Dmayorparty_count=partyResult('Deputy Mayor') 
    total_units_count = Local_unit.objects.distinct().count()  
    context['mayor_party_count']=mayorparty_count
    context['Dmayor_party_count']=Dmayorparty_count
    context['total_units_count']=total_units_count
    return render(request, 'home.html',context=context)

def metro_get_top2_candidates(request):
    position = request.GET.get("position")
    context=metroAndsubmetro()
    if position == "mayor":
        data = context['top2_metro_mayor']
    elif position == "dmayor":
        data = context['top2_metro_Dmayor']
    else:
        return HttpResponse("Invalid position", status=400)

    return render(request, "mayor_Dmayor.html", {"data": data})

def submetro_get_top2_candidates(request):
    position = request.GET.get("position")
    context=metroAndsubmetro()
    if position == "mayor":
        data = context['top2_submetro_mayor']
    elif position == "dmayor":
        data = context['top2_submetro_Dmayor']
    else:
        return HttpResponse("Invalid position", status=400)

    return render(request, "mayor_Dmayor.html", {"data": data})

def province_Result(request):
    province_results = provinceResults()
    
    

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



def unit_results(request):
    unit_name = request.GET.get('municipality')
    print(unit_name)

    try:
        local_unit = Local_unit.objects.get(name=unit_name)
    except Local_unit.DoesNotExist:
        return JsonResponse({'error': 'Local unit not found'}, status=404)

    # Get all candidates related to this local unit
    candidates = Candidate.objects.filter(local_unit=local_unit)

    result = {
        "local_unit": local_unit.name,
        "type": local_unit.type,
        "mayor": [],
        "deputy_mayor": [],
        "chairperson": [],
        "vice_chairperson": []
    }

    has_mayor_group = False
    has_chairperson_group = False

    for candidate in candidates:
        candidate_data = {
            "name": candidate.name,
            "party": candidate.party.party_name,
            "votes": candidate.vote,
            "photo": candidate.photo.url if candidate.photo else '/static/icons/default.png',
            "color": PARTY_COLORS.get(candidate.party.party_name, "#000000")
        }

        if candidate.position == "Mayor":
            result["mayor"].append(candidate_data)
            has_mayor_group = True
        elif candidate.position == "Deputy Mayor":
            result["deputy_mayor"].append(candidate_data)
            has_mayor_group = True
        elif candidate.position == "Chairperson":
            result["chairperson"].append(candidate_data)
            has_chairperson_group = True
        elif candidate.position == "Vice Chairperson":
            result["vice_chairperson"].append(candidate_data)
            has_chairperson_group = True

   
    if has_mayor_group:
        result.pop('chairperson', None)
        result.pop('vice_chairperson', None)
    if has_chairperson_group:
        result.pop('mayor', None)
        result.pop('deputy_mayor', None)

    #print(result)

    return JsonResponse({"results": [result]})


from django.db.models import Max

def ward_info(request):
    unit_name = request.GET.get('municipality')
    print('Fetching ward info for:', unit_name)

    try:
        local_unit = Local_unit.objects.get(name=unit_name)
    except Local_unit.DoesNotExist:
        return JsonResponse({'error': 'Local unit not found'}, status=404)

    total_wards = local_unit.no_wards

    # Get all candidates under this local unit
    candidates = Candidate.objects.filter(local_unit=local_unit)

    ward_results = []

    # Loop over each ward number
    for ward_number in range(1, total_wards + 1):
        ward_data = {
            "ward_number": ward_number,
            "results": {
                "Ward President": [],
                "Female Member": [],
                "Dalit Female Member": [],
                "Member": []
            }
        }

        # Filter candidates for this ward
        ward_candidates = candidates.filter(ward=ward_number)

        # Collect results by position
        for position in ["Ward President", "Female Member", "Dalit Female Member", "Member"]:
            position_candidates = ward_candidates.filter(position=position)

            # Determine max vote to decide 'elected' status
            max_votes = position_candidates.aggregate(Max('vote'))['vote__max']

            # Sort candidates by vote count descending
            sorted_candidates = position_candidates.order_by('-vote')

            for candidate in sorted_candidates:
                candidate_entry = {
                    "name": candidate.name,
                    "party": candidate.party.party_name,
                    "votes": candidate.vote,
                    "elected": candidate.vote == max_votes,
                    "symbol": candidate.party.party_shortname,  # assuming shortname is used as symbol here
                    "icon": candidate.party.logo.url if candidate.party.logo else "/static/icons/default.png"
                }
                ward_data["results"][position].append(candidate_entry)

        ward_results.append(ward_data)

    result = {
        "total_wards": total_wards,
        "wards": ward_results
    }
    print(result)
    return JsonResponse(result)

#to get to the party details page
def party_details(request):
    return render(request, 'party_details.html')

def party_api(request):
    parties = Party.objects.all().order_by('-votes')  # descending order of votes
    data = [
        {
            "name": p.party_name,
            "chairperson": p.chairmen,
            "votes": p.votes,
            "logo": p.logo.url
        }
        for p in parties
    ]
    return JsonResponse(data, safe=False)
