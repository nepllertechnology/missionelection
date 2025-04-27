from django.db import models

# Create your models here.
class Province(models.Model):
    province_name=models.CharField(max_length=100,unique=True)
    province_headquarter=models.CharField(max_length=100)
    
class District(models.Model):
    district_name=models.CharField(max_length=100,unique=True)
    district_headquarter=models.CharField(max_length=100)
    district_population=models.IntegerField()
    province=models.ForeignKey(Province, on_delete=models.CASCADE)

class Local_unit(models.Model):
    name=models.CharField(max_length=100,unique=True)
    type=models.CharField(max_length=100)
    population=models.IntegerField()
    district=models.ForeignKey(District,on_delete=models.CASCADE)

class Ward(models.Model):
    ward_number=models.IntegerField(unique=True)
    ward_population=models.IntegerField()
    local_unit=models.ForeignKey(Local_unit,on_delete=models.CASCADE)

class Election_position(models.Model):
    post=models.CharField(max_length=100,unique=True)

class Party(models.Model):
    party_name=models.CharField(max_length=100)
    party_shortname=models.CharField(max_length=50)
    logo=models.ImageField(upload_to='logo/')
    party_totalvote=models.IntegerField()
    
class Candidate(models.Model):
    name=models.CharField(max_length=100)
    party=models.ForeignKey(Party,on_delete=models.CASCADE)
    vote=models.IntegerField()
    local_unit=models.ForeignKey(Local_unit,on_delete=models.CASCADE)
    ward=models.ForeignKey(Ward,on_delete=models.CASCADE)
    election_position=models.ForeignKey(Election_position,on_delete=models.CASCADE)

