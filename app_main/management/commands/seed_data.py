import random
from django.core.management.base import BaseCommand
from faker import Faker
from faker.exceptions import UniquenessException

from app_main.models import Province, District, Local_unit, Party, Candidate


class Command(BaseCommand):
    help = 'Seed the database with realistic election data for all 75 districts, local units, and wards in Nepali.'

    def handle(self, *args, **kwargs):
        fake = Faker('ne_NP')

        province_names = ["Province 1", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"]
        provinces = []

        for name in province_names:
            province, _ = Province.objects.get_or_create(
                province_name=name,
                defaults={'province_headquarter': fake.city()}
            )
            provinces.append(province)

        self.stdout.write(self.style.SUCCESS("✅ Provinces seeded."))

        districts = []
        district_names = [
            "Kathmandu", "Bhaktapur", "Lalitpur", "Morang", "Parsa", "Chitwan", "Baglung", "Rupandehi",
            "Kaski", "Dhanusa", "Sarlahi", "Mahottari", "Sindhuli", "Bara", "Makwanpur", "Nuwakot",
        ]

        for district_name in district_names:
            province = random.choice(provinces)
            district_fullname = district_name

            district, created = District.objects.get_or_create(
                district_name=district_fullname,
                defaults={
                    'no_localunits': random.randint(1, 3),
                    'no_metropolitan': random.randint(0, 1),
                    'no_municipalities': random.randint(1, 5),
                    'no_villageCouncil': random.randint(2, 6),
                    'total_population': random.randint(50000, 300000),
                    'male_population': random.randint(25000, 150000),
                    'female_population': random.randint(25000, 150000),
                    'province': province
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"District {district_name} seeded."))
            else:
                self.stdout.write(self.style.WARNING(f"District {district_name} already exists. Skipping."))

            districts.append(district)

        local_units = []
        types = ["Metropolitan", "Submetropolitan", "Municipality", "Village Council"]

        used_names = set()

        for district in districts:
            for _ in range(district.no_localunits):
                for attempt in range(5):
                    try:
                        base_name = fake.unique.city()
                        break
                    except UniquenessException:
                        base_name = fake.city() + f" {random.randint(1, 1000)}"
                        break

                full_name = f"{base_name}"

                if full_name in used_names:
                    full_name += f" {random.randint(1, 1000)}"
                used_names.add(full_name)

                lu = Local_unit.objects.create(
                    name=full_name,
                    type=random.choice(types),
                    no_wards=random.randint(1, 3),
                    no_electionCenter=random.randint(1, 10),
                    total_population=random.randint(10000, 80000),
                    no_maleVoters=random.randint(3000, 40000),
                    no_femaleVoters=random.randint(3000, 40000),
                    no_otherVoters=random.randint(0, 10),
                    total_eligibleVoters=random.randint(7000, 75000),
                    district=district
                )
                local_units.append(lu)

        self.stdout.write(self.style.SUCCESS("✅ Local units seeded."))

        party_names = ["Nepali Congress", "CPN-UML", "Maoist Centre", "CPN (Unified Socialist)", "Janata Samajwadi Party","Loktantrik Samajwadi Party","Independent"]
        parties = []

        for pname in party_names:
            party, _ = Party.objects.get_or_create(
                party_name=pname,
                defaults={
                    'party_shortname': pname[:3].upper(),
                    'chairmen': fake.name(),
                    'logo': "images/logo/default.jpg",  
                    'votes': random.randint(1000, 50000)
                }
            )
            parties.append(party)

        self.stdout.write(self.style.SUCCESS("✅ Parties seeded."))

        # Seed Mayor and Deputy Mayor positions (10 data each)
        mayor_positions = ['Mayor', 'Deputy Mayor']
        genders = ['M', 'F']
        education_levels = ['एसएलसी', '१०+२', 'स्नातक', 'मास्टर', 'पीएचडी']
        
        for lu in local_units:
            # Create 10 Mayor and 10 Deputy Mayor for each local unit
            for pos in mayor_positions:
                for _ in range(5):
                    Candidate.objects.create(
                        name=fake.name(),
                        gender=random.choice(genders),
                        photo='images/candidate_photo/default.jpg',  
                        party=random.choice(parties),
                        position=pos,
                        vote=random.randint(0, 5000),
                        local_unit=lu,
                        ward=0,  # No specific ward for Mayor or Deputy Mayor
                        education_level=random.choice(education_levels),
                        address=fake.address(),
                        age=random.randint(25, 70),
                        Is_elected=random.choice([True, False])
                    )

            # Seed positions for each ward in local unit (Ward President, Female Member, Dalit Female Member, Member)
            for ward_number in range(1, lu.no_wards + 1):
                positions_in_ward = ['Ward President', 'Female Member', 'Dalit Female Member', 'Member']
                for pos in positions_in_ward:
                    for _ in range(5):  # 10 data for each position in each ward
                        Candidate.objects.create(
                            name=fake.name(),
                            gender=random.choice(genders),
                            photo='images/candidate_photo/default.jpg',  
                            party=random.choice(parties),
                            position=pos,
                            vote=random.randint(0, 5000),
                            local_unit=lu,
                            ward=ward_number,
                            education_level=random.choice(education_levels),
                            address=fake.address(),
                            age=random.randint(25, 70),
                            Is_elected=random.choice([True, False])
                        )

        self.stdout.write(self.style.SUCCESS("✅ Election data for positions and wards seeded."))
        self.stdout.write(self.style.SUCCESS("🎉 All dummy data successfully inserted."))
