from django.db import models

# Create your models here.
class Province(models.Model):
    province_name=models.CharField(max_length=100,unique=True,primary_key=True)
    province_headquarter=models.CharField(max_length=100)
    
    def __str__(self):
        return self.province_name
    
class District(models.Model):
    district_name=models.CharField(max_length=100,unique=True,primary_key=True)
    no_localunits=models.IntegerField()
    no_metropolitan=models.IntegerField()
    no_municipalities=models.IntegerField()
    no_villageCouncil=models.IntegerField()
    total_population=models.IntegerField()
    male_population=models.IntegerField()
    female_population=models.IntegerField()
    province=models.ForeignKey(Province, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.district_name

class Local_unit(models.Model):
    name=models.CharField(max_length=100,unique=True,primary_key=True)
    type=models.CharField(max_length=100)
    no_wards=models.IntegerField()
    no_electionCenter=models.IntegerField()
    total_population=models.IntegerField()
    no_maleVoters=models.IntegerField()
    no_femaleVoters=models.IntegerField()
    no_otherVoters=models.IntegerField()
    total_eligibleVoters=models.IntegerField()
    district=models.ForeignKey(District,on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    
    
class Party(models.Model):
    party_name=models.CharField(max_length=100,primary_key=True)
    party_shortname=models.CharField(max_length=50)
    chairmen=models.CharField(max_length=30, null=True, blank=True)
    logo=models.ImageField(upload_to='images/logo/')
    votes=models.IntegerField()
    
    def __str__(self):
        return self.party_name

    
class Candidate(models.Model):
    name=models.CharField(max_length=100)
    photo=models.ImageField(upload_to='images/candidate_photo/')
    party=models.ForeignKey(Party,on_delete=models.CASCADE)
    position=models.CharField(max_length=100)
    vote=models.IntegerField()
    local_unit=models.ForeignKey(Local_unit,on_delete=models.CASCADE)
    ward=models.IntegerField()
    
    def __str__(self):
        return self.name

