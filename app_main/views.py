from django.shortcuts import render
from app_main.models import *
# Create your views here.
def home(request):
    province_name=request.GET.get('province')
    district_name=request.GET.get('district')
    localunit_name=request.GET.get('localunit')
    
    parties=Party.objects.all()
    province=Province.objects.all()
    district_=District.objects.filter(province=province_name)
    Local_unit_=Local_unit.objects.filter(district=district_name)
    candidate=Candidate.objects.filter(local_unit=localunit_name)
    
    context={
        'parties':parties,
        'province':province,
        'district_':district_,
        'Local_unit_':Local_unit_,
        'candidate':candidate
    }
    
    return render(request, 'app_main/home.html',context=context)
