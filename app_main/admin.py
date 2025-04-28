from django.contrib import admin
from .models import Province,District,Local_unit,Party,Candidate

# Register your models here.
models=[Province,District,Local_unit,Party,Candidate]
admin.site.register(models)

