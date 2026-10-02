import os
from google import genai

def get_client():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    return genai.Client(api_key=api_key)

def generate_workout_gemini(username: str, age: int, weight: int, goal: str, intensity: str) -> str:
    """
    Generates a personalized, day-by-day 7-day workout plan using Gemini models.
    Includes:
    - Day-wise breakdown (Day 1 - Day 7)
    - Warm-up (5–10 mins)
    - Main workout (exercise details, sets, reps, rest periods)
    - Cooldown or recovery tips
    """
    prompt = f"""You are FitBuddy, an elite personal trainer and fitness coach.
Generate a structured, personalized 7-Day Workout Plan tailored to the user profile below.

User Profile:
- Name: {username}
- Age: {age} years
- Weight: {weight} kg
- Fitness Goal: {goal} (e.g., muscle gain, weight loss, endurance, general wellness)
- Preferred Workout Intensity: {intensity} (low, medium, high)

Formatting Requirements:
1. Provide a comprehensive schedule from Day 1 to Day 7.
2. For each day, provide:
   - Day title and target focus
   - Warm-up (5-10 minutes with specific dynamic exercises)
   - Main Workout (4-6 exercises with targeted sets, repetition ranges, and exact rest intervals)
   - Cooldown or Recovery tips (5-10 minutes static stretching)
3. Ensure the workout volume and pacing accurately match the {intensity} intensity level.
4. Keep the output clean, highly structured, and easy to read.
"""
    try:
        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error invoking Gemini model for workout generation: {e}")
        # Structured fallback
        return f"""Day 1: Full Body Strength & Activation ({intensity.upper()} Intensity)
Warm-up (8 mins): Arm circles, cat-cow, leg swings, 2 mins light jumping jacks.
Main Workout:
- Barbell / Goblet Squats: 4 sets x 10 reps (Rest: 75s)
- Dumbbell Bench Press or Push-ups: 3 sets x 12 reps (Rest: 60s)
- Bent-Over Dumbbell Rows: 3 sets x 12 reps (Rest: 60s)
- Walking Lunges: 3 sets x 10 reps/leg (Rest: 45s)
- Plank Hold: 3 sets x 45 seconds (Rest: 45s)
Cooldown (5 mins): Quad stretch, cobra pose, hamstring stretch.

Day 2: Aerobic Conditioning & Core
Warm-up (6 mins): Torso twists, high knees, inchworms.
Main Workout:
- Cardio Interval Training: 25 mins (Alternate 2 mins moderate with 1 min brisk pace)
- Russian Twists: 3 sets x 20 total reps (Rest: 30s)
- Bird-Dogs: 3 sets x 12 reps/side (Rest: 30s)
- Glute Bridges: 3 sets x 15 reps (Rest: 30s)
Cooldown (5 mins): Child's pose and deep diaphragmatic breathing.

Day 3: Active Rest & Recovery
Movement: 30 minutes light walking, mobility stretches, foam rolling.

Day 4: Upper Body Sculpting
Warm-up (8 mins): Band pull-aparts, arm rotations.
Main Workout:
- Overhead Shoulder Press: 4 sets x 10 reps (Rest: 60s)
- Lat Pulldowns: 3 sets x 12 reps (Rest: 60s)
- Incline Dumbbell Chest Flyes: 3 sets x 12 reps (Rest: 45s)
- Bicep Curls: 3 sets x 12 reps (Rest: 45s)
- Tricep Dips or Pushdowns: 3 sets x 12 reps (Rest: 45s)
Cooldown (5 mins): Doorway chest stretch, cross-body shoulder stretch.

Day 5: Lower Body Power & Posterior Chain
Warm-up (8 mins): Hip openers, bodyweight air squats.
Main Workout:
- Romanian Deadlifts: 4 sets x 10 reps (Rest: 75s)
- Bulgarian Split Squats: 3 sets x 8 reps/leg (Rest: 60s)
- Hamstring Curls: 3 sets x 12 reps (Rest: 45s)
- Standing Calf Raises: 4 sets x 15 reps (Rest: 30s)
Cooldown (6 mins): Pigeon stretch, figure-four stretch.

Day 6: Functional HIIT & Core Burner
Warm-up (6 mins): Light shadow boxing, mountain climbers.
Main Workout:
- Dumbbell Thrusters: 3 sets x 10 reps (Rest: 45s)
- Kettlebell Swings: 3 sets x 15 reps (Rest: 45s)
- Mountain Climbers: 3 sets x 30s (Rest: 30s)
- Bicycle Crunches: 3 sets x 20 reps (Rest: 30s)
Cooldown (6 mins): Cobra stretch, thoracic rotations.

Day 7: Complete Rest & Regeneration
Full rest day. Focus on 8 hours of sleep, proper hydration, and nutritious meals."""
