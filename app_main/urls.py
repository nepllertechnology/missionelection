from django.contrib import admin
from django.urls import path
from app_main import views
urlpatterns = [
    path('', views.home, name='home'),
    path('party-details/', views.party_details, name='party_details'), 
    path('all-candidate-details/', views.all_candidate_details, name='all_candidate_details'), 
    path('api/provinces/', views.get_provinces),
    path('metro_get_top2_candidates/',views.metro_get_top2_candidates),
    path('submetro_get_top2_candidates/',views.submetro_get_top2_candidates),
    path('pichart',views.province_Result),
    path('api/provinces/', views.get_provinces),
    path('api/districts/', views.get_districts),  # Use province_name in URL
    path('api/municipalities/', views.get_municipalities),
    path('search/', views.search_results, name='search_results'),
    path('api/unit_results/', views.unit_results, name='unit_results'),
    path('api/ward_result/', views.ward_info, name='war_info'),
    path('api/party/', views.party_api, name='party_api'),
    
]
