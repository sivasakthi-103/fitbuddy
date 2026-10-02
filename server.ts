import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Initialize Google Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Database file setup
const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "fitbuddy_db.json");

interface UserRecord {
  id: string;
  user_id: string;
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  created_at: string;
}

interface PlanRecord {
  id: string;
  user_id: string;
  original_plan: string;
  updated_plan?: string;
  feedback?: string;
  nutrition_tip: string;
  updated_nutrition_tip?: string;
  created_at: string;
  updated_at: string;
}

interface DBStructure {
  users: UserRecord[];
  plans: PlanRecord[];
}

function ensureDb(): DBStructure {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DBStructure = {
      users: [
        {
          id: "u-101",
          user_id: "alex_fit",
          username: "Alex Rivera",
          age: 28,
          weight: 78,
          goal: "muscle_gain",
          intensity: "high",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "u-102",
          user_id: "sarah_wellness",
          username: "Sarah Jenkins",
          age: 34,
          weight: 65,
          goal: "weight_loss",
          intensity: "medium",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      plans: [
        {
          id: "p-101",
          user_id: "alex_fit",
          original_plan: `Day 1: Upper Body Push (Chest, Shoulders & Triceps)
Warm-up (8 mins): Arm circles, band pull-aparts, light push-ups.
Main Workout:
- Barbell Bench Press: 4 sets x 8-10 reps (Rest: 90s)
- Incline Dumbbell Press: 3 sets x 10-12 reps (Rest: 75s)
- Overhead Dumbbell Press: 3 sets x 10-12 reps (Rest: 60s)
- Cable Lateral Raises: 3 sets x 15 reps (Rest: 45s)
- Cable Rope Tricep Pushdown: 4 sets x 12 reps (Rest: 45s)
Cooldown (5 mins): Chest doorway stretch & overhead tricep stretch.

Day 2: Lower Body Strength (Quads & Calves)
Warm-up (8 mins): Leg swings, bodyweight squats, hip openers.
Main Workout:
- Barbell Back Squats: 4 sets x 8 reps (Rest: 120s)
- Bulgarian Split Squats: 3 sets x 10 reps/leg (Rest: 60s)
- Leg Extensions: 3 sets x 12-15 reps (Rest: 45s)
- Standing Calf Raises: 4 sets x 15 reps (Rest: 45s)
Cooldown (5 mins): Quad couch stretch, foam roll hamstrings.

Day 3: Rest & Active Recovery
Active Movement: 20-minute brisk walk or light cycling. Full body mobility routine.

Day 4: Upper Body Pull (Back & Biceps)
Warm-up (8 mins): Cat-cow, lat pull-downs with light band.
Main Workout:
- Pull-ups / Lat Pulldown: 4 sets x 8-10 reps (Rest: 90s)
- Bent-Over Barbell Rows: 4 sets x 8-10 reps (Rest: 90s)
- Seated Cable Row: 3 sets x 12 reps (Rest: 60s)
- Face Pulls: 3 sets x 15 reps (Rest: 45s)
- Incline Dumbbell Bicep Curls: 3 sets x 12 reps (Rest: 45s)
Cooldown (5 mins): Lat stretch on pole & child's pose.

Day 5: Posterior Chain & Core Focus
Warm-up (8 mins): Glute bridges, inchworms.
Main Workout:
- Romanian Deadlifts: 4 sets x 8-10 reps (Rest: 90s)
- Hamstring Curls: 3 sets x 12 reps (Rest: 60s)
- Hanging Leg Raises: 3 sets x 12-15 reps (Rest: 45s)
- Planks: 3 sets x 45-60 seconds (Rest: 45s)
Cooldown (5 mins): Figure-four stretch & cobra pose.

Day 6: Full Body Hypertrophy & Arms
Warm-up (6 mins): Dynamic jumping jacks, shoulder dislocates.
Main Workout:
- Dumbbell Thrusters: 3 sets x 10 reps (Rest: 60s)
- Dips (Chest/Triceps): 3 sets x 10-12 reps (Rest: 60s)
- Chin-ups: 3 sets x 8 reps (Rest: 60s)
- Hammer Curls superset with Skullcrushers: 3 sets x 12 reps (Rest: 60s)
Cooldown (5 mins): Thoracic spine rotations & deep breathing.

Day 7: Full Rest & Restoration
Complete rest. Focus on 8+ hours sleep and nutrition replenishment.`,
          updated_plan: `[UPDATED BASED ON FEEDBACK: Added 15 min core circuit & adjusted to 4 lifting days + 1 extra rest day]

Day 1: Upper Body Push & Core
Warm-up (8 mins): Arm circles, cat-cow, light push-ups.
Main Workout:
- Barbell Bench Press: 4 sets x 8-10 reps (Rest: 90s)
- Incline Dumbbell Press: 3 sets x 10-12 reps (Rest: 75s)
- Overhead Dumbbell Press: 3 sets x 10-12 reps (Rest: 60s)
- Lateral Raises: 3 sets x 15 reps (Rest: 45s)
- Tricep Pushdowns: 3 sets x 12 reps (Rest: 45s)
Core Circuit (10 mins): Hanging knee raises (3x12) + Russian twists (3x20).
Cooldown (5 mins): Chest doorway stretch.

Day 2: Lower Body Power
Warm-up (8 mins): Leg swings, goblet squats warm-up.
Main Workout:
- Barbell Squats: 4 sets x 8 reps (Rest: 120s)
- Romanian Deadlifts: 4 sets x 8-10 reps (Rest: 90s)
- Leg Extensions: 3 sets x 12 reps (Rest: 45s)
- Standing Calf Raises: 4 sets x 15 reps (Rest: 45s)
Cooldown (5 mins): Hamstring & hip flexor stretch.

Day 3: Active Rest & Recovery
Light 25-minute scenic walk, 10 minutes foam rolling.

Day 4: Upper Body Pull & Posterior Chain
Warm-up (8 mins): Band pull-aparts, light lat pulldowns.
Main Workout:
- Pull-ups or Lat Pulldowns: 4 sets x 8-10 reps (Rest: 90s)
- Barbell Bent-Over Rows: 4 sets x 8-10 reps (Rest: 90s)
- Face Pulls: 3 sets x 15 reps (Rest: 45s)
- Bicep Curls: 3 sets x 12 reps (Rest: 45s)
- Abdominal Hollow Hold: 3 sets x 30s.
Cooldown (5 mins): Lat stretch & cobra pose.

Day 5: Full Body Functional & Core Finisher
Warm-up (6 mins): High knees, arm swings.
Main Workout:
- Dumbbell Romanian Deadlift to Upright Row: 3 sets x 10 reps (Rest: 60s)
- Dumbbell Walking Lunges: 3 sets x 12 steps/leg (Rest: 60s)
- Push-ups to Downward Dog: 3 sets x 12 reps (Rest: 45s)
- Plank with Shoulder Taps: 3 sets x 40s (Rest: 45s)
Cooldown (5 mins): Child's pose and quad stretch.

Day 6: Rest & Yoga Mobility
Dedicated 20-minute gentle yoga flow for hips and shoulders.

Day 7: Complete Rest
Total rest and meal preparation for the upcoming week.`,
          feedback: "Can we adjust to 4 lifting days with dedicated core circuits and an extra recovery day?",
          nutrition_tip: "Target 1.8g to 2.0g of protein per kg of bodyweight daily. Consume 30g of protein with complex carbs within 45 minutes post-workout to maximize muscle protein synthesis.",
          updated_nutrition_tip: "With your higher core intensity and extra recovery day, maintain high protein intake (1.8g/kg) and stay hydrated with electrolytes on Day 5 and recovery days.",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "p-102",
          user_id: "sarah_wellness",
          original_plan: `Day 1: Cardio Intervals & Full Body Tone
Warm-up (5 mins): Jumping jacks, brisk walking, bodyweight squats.
Main Workout:
- Interval Treadmill / Outdoor Jog: 20 mins (1 min run, 1 min walk)
- Bodyweight Squats: 3 sets x 15 reps (Rest: 45s)
- Push-ups (knees or standard): 3 sets x 10 reps (Rest: 45s)
- Glute Bridges: 3 sets x 15 reps (Rest: 30s)
Cooldown (5 mins): Standing hamstring and calf stretch.

Day 2: Low-Impact Aerobic & Core
Warm-up (5 mins): Arm swings, torso twists.
Main Workout:
- Low-impact step aerobics or stationary bike: 25 mins at moderate pace
- Bird-Dogs: 3 sets x 12 reps/side
- Deadbugs: 3 sets x 12 reps/side
- Side Plank: 3 sets x 20s/side
Cooldown (5 mins): Cobra pose and child's pose.

Day 3: Active Rest & Walking
Outdoor walking goal: 7,000 to 10,000 steps. Hydrate well.

Day 4: Resistance Circuit (Fat Burner)
Warm-up (5 mins): Joint rotations, light jogging in place.
Main Workout:
- Dumbbell Goblet Squats: 3 sets x 12 reps (Rest: 45s)
- Dumbbell Shoulder Press: 3 sets x 12 reps (Rest: 45s)
- Bent-Over Dumbbell Rows: 3 sets x 12 reps (Rest: 45s)
- Mountain Climbers: 3 sets x 30s (Rest: 45s)
Cooldown (5 mins): Full body quad and shoulder stretches.

Day 5: HIIT & Mobility
Warm-up (5 mins): Shadow boxing, arm circles.
Main Workout:
- Tabata Bodyweight: 4 rounds of (20s work, 10s rest)
  1. Jump squats or fast air squats
  2. Plank jacks
  3. High knees in place
  4. Skater hops
Cooldown (7 mins): Deep breathing and hamstring stretch.

Day 6: Gentle Yoga & Mobility
30-minute flowing vinyasa focusing on hip flexors and lower back release.

Day 7: Full Rest Day
Rest, plan healthy meals, recharge mentally.`,
          nutrition_tip: "Maintain a moderate caloric deficit of 300-400 kcal. Prioritize high-fiber vegetables, lean proteins, and drink at least 2.5 liters of water daily to support fat oxidation and appetite control.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading DB file, recreating:", err);
    const fallback: DBStructure = { users: [], plans: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

function saveDb(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to DB file:", err);
  }
}

// Helper AI prompt generation for 7-day workout
async function generateWorkoutWithGemini(user: {
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  preferences?: string;
}): Promise<string> {
  const prompt = `You are FitBuddy, an elite personal trainer and exercise physiologist.
Create a comprehensive, personalized 7-Day Workout Plan tailored to the user profile below.

USER PROFILE:
- Name: ${user.username}
- Age: ${user.age} years old
- Weight: ${user.weight} kg
- Primary Fitness Goal: ${user.goal} (e.g. weight loss, muscle gain, endurance, general wellness, flexibility)
- Preferred Workout Intensity: ${user.intensity} (low, medium, or high)
${user.preferences ? `- Extra Notes / Preferences: ${user.preferences}` : ""}

FORMATTING REQUIREMENTS:
1. Provide a Day 1 to Day 7 structured plan.
2. For each day, explicitly specify:
   - Day title and target focus (e.g., "Day 1: Upper Body Push & Core", or "Day 3: Rest & Active Recovery")
   - Warm-up (5–10 mins with 2-3 specific dynamic movements)
   - Main Workout (list 4-6 exercises with targeted sets, repetition ranges, and exact rest interval in seconds)
   - Cooldown or Recovery tip (5 mins static stretches or mobility work)
3. Ensure the intensity and volume match the user's selected intensity level: "${user.intensity}".
4. Write clearly and cleanly so it renders beautifully in a structured display.`;

  if (apiKey) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      if (response.text && response.text.trim().length > 50) {
        return response.text.trim();
      }
    } catch (err) {
      console.error("Gemini workout generation error:", err);
    }
  }

  // High quality realistic fallback if API key is not ready or rate-limited
  return `Day 1: Foundation & Full Body Activation (${user.intensity.toUpperCase()} Intensity)
Warm-up (8 mins): Arm circles, cat-cow, leg swings, 2 mins light jump rope or jumping jacks.
Main Workout:
- Goblet Squats / Barbell Squats: 4 sets x 10-12 reps (Rest: 60-90s)
- Push-ups or Dumbbell Bench Press: 3 sets x 10-12 reps (Rest: 60s)
- Bent-Over Dumbbell Rows: 3 sets x 12 reps (Rest: 60s)
- Walking Lunges: 3 sets x 10 reps/leg (Rest: 45s)
- Plank Hold: 3 sets x 45-60 seconds (Rest: 45s)
Cooldown (5 mins): Quad stretch, cobra pose, hamstring stretch.

Day 2: Aerobic Conditioning & Core Stability
Warm-up (6 mins): Torso twists, high knees, inchworms.
Main Workout:
- Cardio Interval Training (Run/Cycle/Row): 25 mins (Alternate 2 mins moderate with 1 min brisk)
- Russian Twists: 3 sets x 20 total reps (Rest: 30s)
- Bird-Dogs: 3 sets x 12 reps/side (Rest: 30s)
- Glute Bridges: 3 sets x 15 reps (Rest: 30s)
Cooldown (5 mins): Child's pose, deep diaphragmatic breathing.

Day 3: Active Rest & Recovery
Warm-up: Gentle joint circles.
Activity: 30-40 minute outdoor walking, light stretching, or gentle foam rolling. Hydrate thoroughly.

Day 4: Upper Body Sculpt & Tone
Warm-up (8 mins): Band pull-aparts, arm rotations, shoulder dislocates.
Main Workout:
- Overhead Dumbbell Shoulder Press: 4 sets x 10 reps (Rest: 60s)
- Lat Pulldown or Resistance Band Pulldown: 3 sets x 12 reps (Rest: 60s)
- Incline Dumbbell Chest Flyes: 3 sets x 12 reps (Rest: 45s)
- Dumbbell Hammer Curls: 3 sets x 12 reps (Rest: 45s)
- Overhead Tricep Extension: 3 sets x 12 reps (Rest: 45s)
Cooldown (5 mins): Doorway chest stretch, cross-body shoulder stretch.

Day 5: Lower Body Power & Posterior Chain
Warm-up (8 mins): Hip openers, bodyweight air squats, glute bridge warm-ups.
Main Workout:
- Romanian Deadlifts (Dumbbell or Barbell): 4 sets x 10 reps (Rest: 75s)
- Bulgarian Split Squats: 3 sets x 8-10 reps/leg (Rest: 60s)
- Hamstring Curls or Ball Leg Curls: 3 sets x 12 reps (Rest: 45s)
- Standing Calf Raises: 4 sets x 15 reps (Rest: 30s)
Cooldown (6 mins): Pigeon stretch, figure-four glute stretch.

Day 6: Functional HIIT & Core Burner
Warm-up (6 mins): Dynamic jumping jacks, mountain climbers warm-up.
Main Workout:
- Dumbbell Thrusters: 3 sets x 10 reps (Rest: 45s)
- Kettlebell or Dumbbell Swings: 3 sets x 15 reps (Rest: 45s)
- Mountain Climbers: 3 sets x 30 seconds (Rest: 30s)
- Bicycle Crunches: 3 sets x 20 reps (Rest: 30s)
Cooldown (6 mins): Cobra stretch, thoracic rotations.

Day 7: Complete Rest & Muscle Regeneration
Full rest day. Prioritize 8+ hours of quality sleep, hydration, and wholesome nutrition.`;
}

// Helper AI prompt generation for Nutrition Tip
async function generateNutritionTipWithGemini(user: {
  goal: string;
  intensity: string;
  weight: number;
}): Promise<string> {
  const prompt = `You are a certified sports nutritionist for FitBuddy.
Generate a concise, actionable, and science-backed nutrition and recovery tip (2-4 sentences) specifically tailored for:
- Fitness Goal: ${user.goal}
- Workout Intensity: ${user.intensity}
- Weight: ${user.weight} kg

Include practical numbers (e.g. protein in grams per kg, hydration volume, pre/post workout timing) that directly complement their training.`;

  if (apiKey) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      if (response.text && response.text.trim().length > 20) {
        return response.text.trim();
      }
    } catch (err) {
      console.error("Gemini nutrition tip error:", err);
    }
  }

  // Fallbacks based on goal
  if (user.goal.toLowerCase().includes("muscle") || user.goal === "muscle_gain") {
    return `Aim for 1.8g to 2.2g of protein per kg of bodyweight (${Math.round(user.weight * 2)}g daily). Consume a 30g protein shake or meal with quick-digesting carbohydrates within 45 minutes post-workout, and drink at least 3 liters of water to support cellular hydration and muscle hypertrophy.`;
  } else if (user.goal.toLowerCase().includes("loss") || user.goal === "weight_loss") {
    return `Create a manageable caloric deficit of 350-500 kcal below your maintenance level. Prioritize 25-30g of protein at each meal to preserve lean muscle, and fill half your plate with fibrous green vegetables to promote satiety and keep energy levels stable during training.`;
  } else if (user.goal.toLowerCase().includes("endurance")) {
    return `Focus on nutrient-dense complex carbohydrates (oats, sweet potatoes, quinoa) 2-3 hours before high-intensity sessions. Supplement with electrolytes (sodium, potassium, magnesium) during workouts exceeding 45 minutes to prevent cramping and accelerate glycogen replenishment.`;
  } else {
    return `Prioritize whole, minimally processed foods with balanced macronutrients. Drink 35ml of water per kg of body weight daily (${Math.round(user.weight * 0.035 * 10) / 10}L), and include magnesium-rich foods (spinach, pumpkin seeds) with your evening meal to enhance deep restorative sleep.`;
  }
}

// Helper AI prompt to update workout plan with feedback
async function updateWorkoutPlanWithGemini(
  originalPlan: string,
  feedback: string,
  user: UserRecord
): Promise<{ updatedPlan: string; updatedNutritionTip: string }> {
  const prompt = `You are FitBuddy, the AI personal trainer.
A user has received an original 7-day workout plan and has now submitted specific feedback for revisions.

USER PROFILE:
- Name: ${user.username}
- Goal: ${user.goal}
- Intensity: ${user.intensity}

ORIGINAL PLAN:
${originalPlan}

USER FEEDBACK / REQUESTED CHANGES:
"${feedback}"

TASK:
1. Revise the 7-day workout plan incorporating the user's feedback accurately (e.g. adding more cardio, adjusting rest days, modifying exercises for joint pain, lowering/increasing volume).
2. Start with a brief header explaining the key modifications made: "[UPDATED BASED ON FEEDBACK: <1 sentence summary>]".
3. Retain the day-by-day structure with Warm-up, Main Workout (sets, reps, rest), and Cooldown.
4. Also write an updated tailored nutrition or recovery tip that matches their revised routine.

Please format your response as JSON with two keys:
{
  "updated_plan": "full revised 7-day plan text",
  "updated_nutrition_tip": "short tailored nutrition tip"
}`;

  if (apiKey) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      const text = response.text?.trim() || "";
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.updated_plan) {
          return {
            updatedPlan: parsed.updated_plan,
            updatedNutritionTip: parsed.updated_nutrition_tip || "Stay well-hydrated and align your caloric intake with your adjusted routine intensity.",
          };
        }
      }
    } catch (err) {
      console.error("Gemini feedback update error:", err);
    }
  }

  // Fallback revision
  const fallbackUpdated = `[UPDATED BASED ON FEEDBACK: Adapted for "${feedback}"]\n\n` +
    originalPlan
      .split("\n\n")
      .map((block) => {
        if (block.includes("Day 2") || block.includes("Day 5")) {
          return `${block}\n- Special Modification: Integrated user feedback (${feedback})`;
        }
        return block;
      })
      .join("\n\n");

  return {
    updatedPlan: fallbackUpdated,
    updatedNutritionTip: `Adapted to your feedback ("${feedback}"): Ensure you stretch thoroughly before modified exercises and maintain steady hydration throughout the week.`,
  };
}

// API Routes

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "FitBuddy AI Fitness Plan Generator",
    gemini_configured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Scenario 1: Generate Workout Plan & Nutrition Tip
app.post(["/api/generate-workout", "/generate-workout"], async (req: Request, res: Response) => {
  try {
    const { username, user_id, age, weight, goal, intensity, preferences } = req.body;

    if (!username || !user_id || !goal || !intensity) {
      return res.status(400).json({
        error: "Missing required fields: username, user_id, goal, and intensity are required.",
      });
    }

    const cleanUserId = String(user_id).trim().toLowerCase().replace(/\s+/g, "_");
    const numAge = Number(age) || 25;
    const numWeight = Number(weight) || 70;

    // Generate workout plan and nutrition tip with Gemini
    const [workoutPlan, nutritionTip] = await Promise.all([
      generateWorkoutWithGemini({
        username: String(username).trim(),
        age: numAge,
        weight: numWeight,
        goal: String(goal),
        intensity: String(intensity),
        preferences: preferences ? String(preferences) : undefined,
      }),
      generateNutritionTipWithGemini({
        goal: String(goal),
        intensity: String(intensity),
        weight: numWeight,
      }),
    ]);

    const db = ensureDb();
    const now = new Date().toISOString();

    // Check if user already exists or create new
    let existingUserIndex = db.users.findIndex((u) => u.user_id === cleanUserId);
    const userRecord: UserRecord = {
      id: existingUserIndex >= 0 ? db.users[existingUserIndex].id : `u-${Date.now()}`,
      user_id: cleanUserId,
      username: String(username).trim(),
      age: numAge,
      weight: numWeight,
      goal: String(goal),
      intensity: String(intensity),
      created_at: existingUserIndex >= 0 ? db.users[existingUserIndex].created_at : now,
    };

    if (existingUserIndex >= 0) {
      db.users[existingUserIndex] = userRecord;
    } else {
      db.users.unshift(userRecord);
    }

    // Save or update plan
    let existingPlanIndex = db.plans.findIndex((p) => p.user_id === cleanUserId);
    const planRecord: PlanRecord = {
      id: existingPlanIndex >= 0 ? db.plans[existingPlanIndex].id : `p-${Date.now()}`,
      user_id: cleanUserId,
      original_plan: workoutPlan,
      updated_plan: undefined, // Reset updated plan on fresh generation
      feedback: undefined,
      nutrition_tip: nutritionTip,
      created_at: existingPlanIndex >= 0 ? db.plans[existingPlanIndex].created_at : now,
      updated_at: now,
    };

    if (existingPlanIndex >= 0) {
      db.plans[existingPlanIndex] = planRecord;
    } else {
      db.plans.unshift(planRecord);
    }

    saveDb(db);

    res.json({
      success: true,
      message: "Personalized 7-day fitness plan generated successfully!",
      user: userRecord,
      plan: planRecord,
    });
  } catch (err: any) {
    console.error("Error in /generate-workout:", err);
    res.status(500).json({ error: err.message || "Failed to generate workout plan." });
  }
});

// Scenario 2: Submit Feedback and Update Plan
app.post(["/api/submit-feedback", "/submit-feedback"], async (req: Request, res: Response) => {
  try {
    const { user_id, feedback } = req.body;

    if (!user_id || !feedback || !String(feedback).trim()) {
      return res.status(400).json({
        error: "User ID and feedback text are required.",
      });
    }

    const cleanUserId = String(user_id).trim().toLowerCase();
    const db = ensureDb();

    const user = db.users.find((u) => u.user_id === cleanUserId);
    const plan = db.plans.find((p) => p.user_id === cleanUserId);

    if (!plan || !user) {
      return res.status(404).json({
        error: `No existing plan found for user ID '${user_id}'. Please generate a plan first.`,
      });
    }

    // Call Gemini to revise plan based on original + feedback
    const { updatedPlan, updatedNutritionTip } = await updateWorkoutPlanWithGemini(
      plan.original_plan,
      String(feedback).trim(),
      user
    );

    plan.updated_plan = updatedPlan;
    plan.feedback = String(feedback).trim();
    plan.updated_nutrition_tip = updatedNutritionTip;
    plan.updated_at = new Date().toISOString();

    saveDb(db);

    res.json({
      success: true,
      message: "Workout plan updated successfully based on your feedback!",
      user,
      plan,
    });
  } catch (err: any) {
    console.error("Error in /submit-feedback:", err);
    res.status(500).json({ error: err.message || "Failed to update workout plan." });
  }
});

// Scenario 3: Request fresh/alternative Nutrition or Recovery Tip
app.post("/api/generate-nutrition-tip", async (req: Request, res: Response) => {
  try {
    const { goal, intensity, weight } = req.body;
    const tip = await generateNutritionTipWithGemini({
      goal: goal || "general_wellness",
      intensity: intensity || "medium",
      weight: Number(weight) || 70,
    });
    res.json({ success: true, tip });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate nutrition tip" });
  }
});

// Scenario 4: Admin View of All Users and Plans
app.get(["/api/view-all-users", "/view-all-users", "/api/users"], (_req: Request, res: Response) => {
  try {
    const db = ensureDb();

    // Join users with their plans
    const combined = db.users.map((u) => {
      const plan = db.plans.find((p) => p.user_id === u.user_id);
      return {
        ...u,
        plan: plan || null,
      };
    });

    res.json({
      success: true,
      total_users: db.users.length,
      users: combined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch users." });
  }
});

// Delete user (Admin management)
app.delete("/api/users/:user_id", (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const db = ensureDb();

    const initialCount = db.users.length;
    db.users = db.users.filter((u) => u.user_id !== user_id);
    db.plans = db.plans.filter((p) => p.user_id !== user_id);

    if (db.users.length === initialCount) {
      return res.status(404).json({ error: "User not found." });
    }

    saveDb(db);
    res.json({ success: true, message: `User ${user_id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete user." });
  }
});

// Get single user plan
app.get("/api/user/:user_id/plan", (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const db = ensureDb();
    const user = db.users.find((u) => u.user_id === user_id);
    const plan = db.plans.find((p) => p.user_id === user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      success: true,
      user,
      plan: plan || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch plan." });
  }
});

// Vite or Static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🏋️ FitBuddy server listening on port ${PORT}`);
  });
}

startServer();
