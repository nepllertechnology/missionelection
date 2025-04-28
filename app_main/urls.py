from django.contrib import admin
from django.urls import path
from app_main import views
urlpatterns = [
    path('', views.home),
     path('api/provinces/', views.get_provinces),
    path('api/districts/', views.get_districts),  # Use province_name in URL
    path('api/municipalities/', views.get_municipalities),
]
