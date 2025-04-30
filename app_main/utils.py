from django.db.models import Max,Count,F, Subquery, OuterRef
from django.db.models import Q
from itertools import groupby
from operator import itemgetter
from collections import Counter
from .models import *


def top2(candidates):
    top2_per_unit = {
    unit: list(group)[:2] for unit, group in groupby(candidates, key=itemgetter('local_unit'))
    }
    return top2_per_unit

def metroAndsubmetro():
    metro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','party__logo','vote','photo')
    metro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','party','name','vote','photo')

    submetro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Sub Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','vote','photo')
    submetro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Sub Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','vote','photo')
    
    top2_metro_mayor = top2(metro_mayor_candidates)
    top2_metro_Dmayor = top2(metro_Dmayor_candidates)
    
    top2_submetro_mayor = top2(submetro_mayor_candidates)
    top2_submetro_Dmayor = top2(submetro_Dmayor_candidates)
    
    
    context={
        'top2_metro_mayor':top2_metro_mayor,
        'top2_metro_Dmayor':top2_metro_Dmayor,
        'top2_submetro_mayor':top2_submetro_mayor,
        'top2_submetro_Dmayor':top2_submetro_Dmayor
    }
    return context

def partyResult():
    max_vote_subquery = Candidate.objects.filter(position='Mayor',local_unit=OuterRef('local_unit')).values('local_unit').annotate(max_vote=Max('vote')).values('max_vote')

    winners = Candidate.objects.filter(position='Mayor',vote=Subquery(max_vote_subquery))

    party_count = Counter()
    for winner in winners:
        party_count[winner.party.party_name] += 1
        

    return dict(party_count)