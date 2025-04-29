from django.shortcuts import render
from django.http import JsonResponse
from app_main.utils import top2

from .models import *

# Home view remains the same
def home(request):
    parties=Party.objects.all()
    
    metro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','vote')
    metro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','vote')

    submetro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Sub Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','vote')
    submetro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Sub Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','vote')
    
    top2_metro_mayor = top2(metro_mayor_candidates)
    top2_metro_Dmayor = top2(metro_Dmayor_candidates)
    
    top2_submetro_mayor = top2(submetro_mayor_candidates)
    top2_submetro_Dmayor = top2(submetro_Dmayor_candidates)
    
    print(top2_metro_mayor)
    
    context={
        'top2_metro_mayor':top2_metro_mayor,
        'top2_metro_Dmayor':top2_metro_Dmayor,
        'top2_submetro_mayor':top2_submetro_mayor,
        'top2_submetro_Dmayor':top2_submetro_Dmayor,
        'parties':parties
    }
    
    return render(request, 'app_main/home.html',context=context)

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

