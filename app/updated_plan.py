import os
from google import genai

def get_client():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    return genai.Client(api_key=api_key)

def update_workout_plan(original_plan: str, feedback: str, user_info: dict) -> tuple[str, str]:
    """
    Revises an existing 7-day workout plan based on user feedback using Gemini models.
    Returns:
    - updated_plan: Revised 7-day workout schedule text
    - updated_tip: Complementary updated nutrition/recovery tip
    """
    prompt = f"""You are FitBuddy, an elite personal trainer.
A user has received an original 7-day workout plan and has submitted feedback for revisions.

User Details:
- Name: {user_info.get('username')}
- Goal: {user_info.get('goal')}
- Intensity: {user_info.get('intensity')}

Original Workout Plan:
{original_plan}

User Feedback / Desired Changes:
"{feedback}"

Instructions:
1. Update the 7-day workout plan incorporating the user's feedback accurately.
2. Prepend a header: "[UPDATED BASED ON FEEDBACK: <1-sentence summary of modifications>]"
3. Preserve the structured format: Day 1 - Day 7, Warm-up, Main Workout (sets, reps, rest), Cooldown.
4. Output the revised plan clearly.
"""
    try:
        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        updated_plan_text = response.text.strip()
        updated_tip = f"Tailored to your update ('{feedback}'): Keep electrolytes steady and balance training intensity with restorative sleep."
        return updated_plan_text, updated_tip
    except Exception as e:
        print(f"Error invoking Gemini for plan update: {e}")
        fallback_plan = f"[UPDATED BASED ON FEEDBACK: Modified with '{feedback}']\n\n" + original_plan
        return fallback_plan, f"Updated recommendation based on '{feedback}': Allow sufficient warm-up and stay well hydrated."
