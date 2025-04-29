from django.contrib import admin
from django.urls import path
from app_main import views
urlpatterns = [
    path('', views.home),
     path('api/provinces/', views.get_provinces),
    path('api/districts/', views.get_districts), 
    path('api/municipalities/', views.get_municipalities),
    path('search/', views.search_results, name='search_results'),
    path('candidate_list_ajax/', views.candidate_list_ajax, name='candidate_list_ajax'),


]
