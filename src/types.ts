export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  preferences?: string;
  created_at: string;
}

export interface WorkoutPlan {
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

export interface UserWithPlan extends UserProfile {
  plan: WorkoutPlan | null;
}

export interface ParsedDayWorkout {
  dayNumber: number;
  title: string;
  focus: string;
  warmup: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    rest: string;
    details?: string;
  }[];
  cooldown: string;
  rawText: string;
  isRestDay: boolean;
}
