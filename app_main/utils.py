from django.db.models import Max,Count,F, Subquery, OuterRef,Sum
from django.db.models import Q
from itertools import groupby
from operator import itemgetter
from collections import Counter,defaultdict
from .models import *


def top2(candidates):
    top2_per_unit = {
    unit: list(group)[:2] for unit, group in groupby(candidates, key=itemgetter('local_unit'))
    }
    return top2_per_unit

def metroAndsubmetro():
    metro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','party__logo','vote','photo','local_unit__total_eligibleVoters')
    metro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Metropolitan').order_by('local_unit', '-vote').values('local_unit','party','name','vote','photo','party__logo','local_unit__total_eligibleVoters')

    submetro_mayor_candidates=Candidate.objects.filter(position='Mayor',local_unit__type='Submetropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','vote','photo','party__logo','local_unit__total_eligibleVoters')
    submetro_Dmayor_candidates=Candidate.objects.filter(position='Deputy Mayor',local_unit__type='Submetropolitan').order_by('local_unit', '-vote').values('local_unit','name','party','vote','photo','party__logo','local_unit__total_eligibleVoters')
    
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

def partyResult(post):
    max_vote_subquery = Candidate.objects.filter(position=post,local_unit=OuterRef('local_unit')).values('local_unit').annotate(max_vote=Max('vote')).values('max_vote')

    winners = Candidate.objects.filter(position=post,vote=Subquery(max_vote_subquery)).select_related('party')

    party_data = defaultdict(lambda: {'count': 0, 'logo': None})
    for winner in winners:
        party_name = winner.party.party_name
        party_data[party_name]['count'] += 1
        party_data[party_name]['logo'] = winner.party.logo if winner.party.logo else None
        

    return dict(party_data)

def provinceResults():
    results = []

    for province in Province.objects.all():
        local_units = Local_unit.objects.filter(district__province=province)
        candidate_scope = Candidate.objects.filter(local_unit__in=local_units)
        max_vote_subquery = Candidate.objects.filter(local_unit=OuterRef('local_unit'),ward=OuterRef('ward'),position=OuterRef('position')).order_by('-vote').values('vote')[:1]
        winners = candidate_scope.annotate(max_vote=Subquery(max_vote_subquery)).filter(vote=F('max_vote'))
        total_party_wins = winners.values('party').annotate(wins=Count('id')).order_by('-wins')
        
        results.append({
            'province': province.province_name,
            'total_party_wins': list(total_party_wins)
        })

    return results