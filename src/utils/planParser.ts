import { ParsedDayWorkout } from "../types";

export function parseWorkoutPlan(planText: string): ParsedDayWorkout[] {
  if (!planText || !planText.trim()) return [];

  const days: ParsedDayWorkout[] = [];
  // Split by Day indicators (e.g. "Day 1:", "Day 2 -", "**Day 3:**")
  const dayRegex = /(?:^|\n)(?:###\s*)?(?:Day\s*(\d+)[:\s\-]+)([^\n]*)/gi;
  const matches = [...planText.matchAll(dayRegex)];

  if (matches.length === 0) {
    // Fallback single block
    return [
      {
        dayNumber: 1,
        title: "Day 1: Full Routine",
        focus: "Comprehensive Session",
        warmup: "5-10 mins dynamic warm-up",
        exercises: [],
        cooldown: "5 mins stretching",
        rawText: planText,
        isRestDay: planText.toLowerCase().includes("rest day"),
      },
    ];
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const dayNum = parseInt(match[1], 10);
    const dayTitleRemainder = match[2]?.trim() || "";
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : planText.length;
    const body = planText.substring(startIndex, endIndex).trim();

    const isRest =
      dayTitleRemainder.toLowerCase().includes("rest") ||
      body.toLowerCase().includes("complete rest") ||
      body.toLowerCase().includes("active rest");

    // Extract warmup
    let warmup = "";
    const warmupMatch = body.match(/Warm-up[^\:]*:\s*([^\n]+)/i);
    if (warmupMatch) {
      warmup = warmupMatch[1].trim();
    }

    // Extract cooldown
    let cooldown = "";
    const cooldownMatch = body.match(/Cooldown[^\:]*:\s*([^\n]+)/i);
    if (cooldownMatch) {
      cooldown = cooldownMatch[1].trim();
    }

    // Extract exercises (bullet points or dash list)
    const exerciseLines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-") || l.startsWith("*") || /^\d+\./.test(l));

    const exercises = exerciseLines.map((line) => {
      const clean = line.replace(/^[\-\*\d\.]+\s*/, "");
      // Try to parse sets, reps, rest
      const restMatch = clean.match(/Rest[:\s]+([^)]+)/i);
      const setsRepsMatch = clean.match(/(\d+)\s*sets?\s*(?:x|of)?\s*([\d\-]+(?:\s*reps|\s*secs|\s*mins)?)/i);

      let name = clean;
      let sets = "3-4";
      let reps = "10-12";
      let rest = "60s";

      if (clean.includes(":")) {
        const parts = clean.split(":");
        name = parts[0].trim();
      }

      if (restMatch) {
        rest = restMatch[1].replace(/[()]/g, "").trim();
      }
      if (setsRepsMatch) {
        sets = setsRepsMatch[1].trim();
        reps = setsRepsMatch[2].trim();
      }

      return {
        name,
        sets,
        reps,
        rest,
        details: clean,
      };
    });

    days.push({
      dayNumber: dayNum,
      title: `Day ${dayNum}: ${dayTitleRemainder || "Workout Session"}`,
      focus: dayTitleRemainder || (isRest ? "Rest & Recovery" : "Strength & Conditioning"),
      warmup: warmup || (isRest ? "Gentle mobility & light walking" : "5-10 min dynamic mobility & joint rotations"),
      exercises,
      cooldown: cooldown || (isRest ? "Relaxation & hydration" : "5-8 min static stretching & foam rolling"),
      rawText: `Day ${dayNum}: ${dayTitleRemainder}\n${body}`,
      isRestDay: isRest,
    });
  }

  return days;
}
