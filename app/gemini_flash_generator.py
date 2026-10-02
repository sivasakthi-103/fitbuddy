import os
from google import genai

def get_client():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    return genai.Client(api_key=api_key)

def generate_nutrition_tip_with_flash(goal: str, intensity: str, weight: int = 70) -> str:
    """
    Generates a concise, practical nutrition or recovery tip tailored to the user's selected goal
    using the Gemini Flash model.
    """
    prompt = f"""You are a sports nutritionist and recovery specialist for FitBuddy.
Generate a concise, practical, and highly actionable nutrition or recovery tip (2-3 sentences max) tailored for:
- Fitness Goal: {goal}
- Training Intensity: {intensity}
- Body Weight: {weight} kg

Include specific numerical guidance (e.g. grams of protein/kg, hydration volume, pre/post workout timing) to complement their training.
"""
    try:
        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error invoking Gemini Flash for nutrition tip: {e}")
        if "muscle" in goal.lower():
            return f"Consume 1.8g to 2.2g of protein per kg of bodyweight ({int(weight * 2)}g daily). Have a 30g protein shake with carbohydrates within 45 minutes post-workout, and drink at least 3 liters of water for muscle repair."
        elif "loss" in goal.lower():
            return "Maintain a moderate caloric deficit of 350-500 kcal. Prioritize 25-30g of lean protein at every meal, drink at least 2.5L of water daily, and load your plate with fibrous green vegetables to stay full."
        else:
            return f"Hydrate with at least 35ml of water per kg of bodyweight ({round(weight * 0.035, 1)}L) daily. Balance each meal with whole-food carbohydrates and lean protein to sustain your {intensity} intensity workouts."
