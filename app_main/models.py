from django.db import models

# Create your models here.
class Province(models.Model):
    province_name=models.CharField(max_length=100,unique=True,primary_key=True)
    province_headquarter=models.CharField(max_length=100)
    
class District(models.Model):
    district_name=models.CharField(max_length=100,unique=True,primary_key=True)
    no_localunits=models.IntegerField()
    no_metropolitan=models.ImageField()
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
    election_center=models.CharField(max_length=100)
    total_population=models.IntegerField()
    no_maleVoters=models.IntegerField()
    no_femaleVoters=models.IntegerField()
    no_otherVoters=models.IntegerField()
    total_eligibleVoters=models.IntegerField()
    district=models.ForeignKey(District,on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name

# class Ward(models.Model):
#     ward_number=models.IntegerField(unique=True)
#     ward_president=models.IntegerField()
#     female_member=models.IntegerField()
#     dalit_femaleMember=models.IntegerField()
#     member=models.IntegerField()
#     local_unit=models.ForeignKey(Local_unit,on_delete=models.CASCADE)


class Party(models.Model):
    party_name=models.CharField(max_length=100,primary_key=True)
    party_shortname=models.CharField(max_length=50)
    logo=models.ImageField(upload_to='logo/')
    
    def __str__(self):
        return self.party_name

    
class Candidate(models.Model):
    name=models.CharField(max_length=100)
    photo=models.ImageField(upload_to='candidate_photo/')
    party=models.ForeignKey(Party,on_delete=models.CASCADE)
    position=models.CharField(max_length=100)
    vote=models.IntegerField()
    local_unit=models.ForeignKey(Local_unit,on_delete=models.CASCADE)
    # ward=models.ForeignKey(Ward,on_delete=models.CASCADE)
    ward=models.IntegerField()
    
    def __str__(self):
        return self.name

