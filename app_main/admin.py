from django.contrib import admin
from .models import Province,District,Local_unit,Party,Candidate

# Register your models here.
admin.site.register(Province)
admin.site.register(District)
admin.site.register(Local_unit)
admin.site.register(Party)
admin.site.register(Candidate)
