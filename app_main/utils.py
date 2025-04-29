from itertools import groupby
from operator import itemgetter


def top2(candidates):
    top2_per_unit = {
    unit: list(group)[:2] for unit, group in groupby(candidates, key=itemgetter('local_unit'))
    }
    return top2_per_unit