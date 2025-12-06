# scripts/indian_seed_generator.py

from app.database.db import SessionLocal, Base, engine
from app.database.user_schema import User
from app.database.twin_schema import Twin
from app.core.baseline_model import build_baseline_for_twin
import random

# ✅ Make sure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ============================
# 1. USERS (25 USERS)
# ============================

names = [
    "Rahul Sharma", "Priya Verma", "Faizan Khan", "Amit Patel", "Rohit Mehta",
    "Neha Singh", "Arjun Reddy", "Sana Qureshi", "Vikas Yadav", "Pallavi Joshi",
    "Manish Kumar", "Ritu Agarwal", "Sameer Sheikh", "Kiran Naik", "Sunita Devi",
    "Akash Mishra", "Pooja Malhotra", "Deepak Chauhan", "Aarti Kulkarni",
    "Imran Pathan", "Shweta Nair", "Sachin Jadhav", "Anjali Bansal",
    "Tanmay Ghosh", "Muskan Ali"
]

emails = [n.split()[0].lower() + "@gmail.com" for n in names]

users = [User(email=emails[i], name=names[i], password_hash="demo") for i in range(25)]

db.add_all(users)
db.commit()

# ============================
# 2. TWINS (25 DIGITAL HUMANS)
# ============================

cities = [
    ("Delhi", 28.6139, 77.2090, 210),
    ("Bangalore", 12.9716, 77.5946, 92),
    ("Kanpur", 26.4499, 80.3319, 185),
    ("Ahmedabad", 23.0225, 72.5714, 110),
    ("Pune", 18.5204, 73.8567, 95),
    ("Hyderabad", 17.3850, 78.4867, 140),
    ("Indore", 22.7196, 75.8577, 98),
]

twins = []

for i in range(25):
    city, lat, lon, aqi = random.choice(cities)

    t = Twin(
        user_id=users[i].id,
        name=names[i],
        age=random.randint(22, 40),
        gender="male" if i % 2 == 0 else "female",
        height_cm=random.randint(155, 180),
        weight_kg=random.randint(52, 92),
        systolic_bp=random.randint(110, 145),
        diastolic_bp=random.randint(70, 95),
        fasting_sugar=random.randint(85, 120),
        resting_hr=random.randint(60, 90),
        spo2=random.randint(95, 99),
        cholesterol=random.randint(155, 245),
        sleep_hours=round(random.uniform(5.5, 8.5), 1),
        exercise_level=random.randint(0, 3),
        stress_level=random.randint(0, 3),
        smoking=random.randint(0, 1),
        alcohol=random.randint(0, 3),
        screen_time_hours=round(random.uniform(4, 10), 1),
        income=random.randint(300000, 1500000),
        city=city,
        latitude=lat,
        longitude=lon,
        aqi=aqi,
        daily_steps=random.randint(2000, 12000),
        diet_type=random.choice(["veg", "nonveg", "egg"]),
        commute_hours=round(random.uniform(0.5, 2.5), 1),
        ac_exposure_hours=random.randint(1, 8),
        tea_coffee_per_day=random.randint(0, 6),
        outside_food_per_week=random.randint(0, 7),
    )

    t = build_baseline_for_twin(t)
    twins.append(t)

db.add_all(twins)
db.commit()
db.close()

print("✅ ALL 25 USERS + 25 TWINS INSERTED SUCCESSFULLY INTO app.db ✅")
