import Groq from 'groq-sdk';
import Workout from '../models/Workout.js';

// Initialize Groq AI
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Default model - Groq supports: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
const MODEL = 'llama-3.3-70b-versatile';

// Analyze workouts and generate insights
export const analyzePerformance = async (userId, workouts) => {
  if (!groq) {
    return generateMockInsights(workouts);
  }
  
  try {
    // Prepare workout summary for AI
    const workoutSummary = prepareWorkoutSummary(workouts);
    
    const prompt = `You are an elite sports performance coach and data analyst. Analyze the following workout data for an athlete and provide comprehensive insights.

WORKOUT DATA:
${JSON.stringify(workoutSummary, null, 2)}

Provide your analysis in the following JSON format (ONLY output valid JSON, no markdown):
{
  "performanceScore": <number 0-100>,
  "scoreBreakdown": {
    "consistency": <number 0-100>,
    "intensity": <number 0-100>,
    "recovery": <number 0-100>,
    "progression": <number 0-100>
  },
  "weeklyTrainingLoad": "<low|moderate|high|very high>",
  "fatigueRisk": "<low|moderate|high>",
  "keyInsights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>"
  ],
  "trends": {
    "positive": ["<trend 1>", "<trend 2>"],
    "negative": ["<trend 1>"]
  },
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<training|recovery|nutrition|technique>",
      "title": "<short title>",
      "description": "<detailed recommendation>"
    }
  ],
  "weeklyPlan": {
    "monday": "<workout suggestion>",
    "tuesday": "<workout suggestion>",
    "wednesday": "<workout suggestion>",
    "thursday": "<workout suggestion>",
    "friday": "<workout suggestion>",
    "saturday": "<workout suggestion>",
    "sunday": "<workout suggestion>"
  },
  "summary": "<2-3 sentence overall summary>"
}

Be specific, actionable, and athlete-friendly in your recommendations. Focus on sustainable performance improvement.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });
    
    const text = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateMockInsights(workouts);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return generateMockInsights(workouts);
  }
};

// Generate chat response for AI assistant
export const generateChatResponse = async (userId, message, workoutContext) => {
  if (!groq) {
    return {
      response: "I'm currently running in demo mode. To get AI-powered insights, please configure your Groq API key. In the meantime, I can tell you that your training data shows good consistency!",
      suggestions: [
        "View your performance trends",
        "Log a new workout",
        "Export your training plan"
      ]
    };
  }
  
  try {
    const systemPrompt = `You are "Coach AI" — an elite sports performance coach and fitness mentor with expertise in:

🏋️ TRAINING & EXERCISE
- Strength training, cardio, HIIT, endurance, mobility
- Periodization, progressive overload, deload strategies
- Form correction, injury prevention, movement patterns
- Sport-specific training for running, cycling, swimming, CrossFit

🥗 NUTRITION & DIET
- Pre/post workout nutrition, macros, meal timing
- Hydration strategies, supplements (evidence-based)
- Cutting, bulking, body recomposition advice
- Recovery nutrition, anti-inflammatory foods

😴 RECOVERY & WELLNESS
- Sleep optimization, rest days, active recovery
- Stress management, overtraining prevention
- HRV, fatigue monitoring, readiness indicators
- Stretching, foam rolling, mobility work

📊 DATA-DRIVEN COACHING
- Analyze workout patterns, identify trends
- Provide personalized recommendations based on their data
- Track progress, celebrate wins, address weaknesses

PERSONALITY:
- Be encouraging, motivating, and supportive
- Give crisp, actionable advice (2-4 sentences max)
- Use simple language, avoid jargon unless asked
- Reference their actual workout data when relevant
- Be honest about limitations, suggest professional help when needed

RESPONSE STYLE:
- Direct and to-the-point
- Use bullet points for complex answers
- Include 1 actionable tip per response
- Be conversational, not robotic`;

    const userPrompt = `ATHLETE'S WORKOUT DATA:
${JSON.stringify(workoutContext, null, 2)}

ATHLETE'S QUESTION: "${message}"

Respond as Coach AI. Keep it crisp (2-4 sentences). Reference their data if relevant.

Format as JSON ONLY:
{
  "response": "<your coaching response>",
  "suggestions": ["<follow-up question 1>", "<follow-up question 2>", "<follow-up question 3>"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });
    
    const text = completion.choices[0]?.message?.content || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { response: text, suggestions: [] };
  } catch (error) {
    console.error('Chat AI Error:', error);
    return {
      response: "I encountered an issue processing your request. Please try again!",
      suggestions: ["Tell me about my recent workouts", "How am I progressing?"]
    };
  }
};

// Prepare workout data summary for AI analysis
function prepareWorkoutSummary(workouts) {
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  
  const thisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  const lastWeek = workouts.filter(w => {
    const date = new Date(w.date);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });
  
  const summary = {
    totalWorkouts: workouts.length,
    thisWeek: {
      count: thisWeek.length,
      totalDuration: thisWeek.reduce((sum, w) => sum + (w.duration || 0), 0),
      avgRpe: calculateAverage(thisWeek.map(w => w.rpe).filter(Boolean)),
      byType: groupByType(thisWeek)
    },
    lastWeek: {
      count: lastWeek.length,
      totalDuration: lastWeek.reduce((sum, w) => sum + (w.duration || 0), 0),
      avgRpe: calculateAverage(lastWeek.map(w => w.rpe).filter(Boolean)),
      byType: groupByType(lastWeek)
    },
    running: {
      totalDistance: workouts
        .filter(w => w.type === 'run')
        .reduce((sum, w) => sum + (w.run?.distance || 0), 0),
      avgPace: calculateAverage(
        workouts.filter(w => w.type === 'run').map(w => w.run?.pace).filter(Boolean)
      )
    },
    recentBiometrics: workouts
      .filter(w => w.type === 'biometrics')
      .slice(0, 5)
      .map(w => ({
        date: w.date,
        weight: w.biometrics?.weight,
        sleep: w.biometrics?.sleepHours,
        hrv: w.biometrics?.hrv,
        mood: w.biometrics?.mood
      }))
  };
  
  return summary;
}

function groupByType(workouts) {
  return workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length * 10) / 10;
}

// Generate mock insights when API is not available
function generateMockInsights(workouts) {
  const totalWorkouts = workouts.length;
  const recentWorkouts = workouts.slice(0, 7);
  
  return {
    performanceScore: Math.min(95, 60 + totalWorkouts * 2),
    scoreBreakdown: {
      consistency: Math.min(100, 50 + totalWorkouts * 3),
      intensity: 75,
      recovery: 70,
      progression: 80
    },
    weeklyTrainingLoad: totalWorkouts > 5 ? 'high' : totalWorkouts > 3 ? 'moderate' : 'low',
    fatigueRisk: totalWorkouts > 6 ? 'moderate' : 'low',
    keyInsights: [
      `You've completed ${totalWorkouts} workouts - great dedication!`,
      "Your training consistency is building a strong foundation",
      "Consider adding more variety to your workout types"
    ],
    trends: {
      positive: ["Consistent training schedule", "Good workout frequency"],
      negative: totalWorkouts < 3 ? ["Training volume could increase"] : []
    },
    recommendations: [
      {
        priority: "high",
        category: "training",
        title: "Maintain Consistency",
        description: "Keep up your current training frequency. Aim for at least 4-5 workouts per week."
      },
      {
        priority: "medium",
        category: "recovery",
        title: "Track Sleep & Recovery",
        description: "Log your biometrics daily to get better insights into your recovery patterns."
      },
      {
        priority: "low",
        category: "technique",
        title: "Add Interval Training",
        description: "Incorporate one high-intensity interval session per week to boost performance."
      }
    ],
    weeklyPlan: {
      monday: "Easy run or recovery workout",
      tuesday: "Strength training - upper body focus",
      wednesday: "Tempo run or moderate cardio",
      thursday: "Cross-training or active recovery",
      friday: "Strength training - lower body focus",
      saturday: "Long run or endurance workout",
      sunday: "Rest day or light yoga"
    },
    summary: "Your training is showing good consistency. Focus on maintaining your current routine while gradually increasing intensity. Don't forget to prioritize recovery between sessions."
  };
}

// Generate personalized training plan using AI
export const generatePersonalizedPlan = async (userId, planConfig, workoutHistory, recoveryScore) => {
  const { type, difficulty, duration, goal } = planConfig;
  
  if (!groq) {
    return generateFallbackPlan(type, difficulty, duration);
  }
  
  try {
    // Prepare workout history summary
    const historySummary = prepareHistoryForPlan(workoutHistory);
    
    const prompt = `You are an elite certified sports coach creating a detailed, followable ${duration}-week training plan. Athletes will use this as their DAILY guide.

ATHLETE PROFILE:
- Plan Type: ${type} (${getPlanDescription(type)})
- Experience Level: ${difficulty}
- Goal: ${goal || `Complete ${type} training successfully`}
- Recovery Score: ${recoveryScore || 75}/100

RECENT TRAINING HISTORY:
${JSON.stringify(historySummary, null, 2)}

Create a DETAILED ${duration}-week training plan. Each workout should be so specific that an athlete can follow it without any additional guidance.

CRITICAL REQUIREMENTS:
1. Each workout must have: warm-up routine, main workout with specific sets/reps/pace, cool-down
2. Include exact paces, heart rate zones, weights guidance (based on % of max or RPE)
3. Progressive overload - each week should build on the previous logically
4. For running: specify pace zones (easy = Zone 2, tempo = Zone 4, etc.)
5. For strength: include exercise names, sets, reps, rest periods
6. Include "coachingNotes" with technique tips and what to focus on
7. If recovery score < 50, reduce intensity significantly

Output ONLY valid JSON:
{
  "planName": "<personalized descriptive plan name>",
  "weeklyOverview": "<3-4 sentence overview of plan philosophy and progression>",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "<Build Base|Speed Development|Strength Phase|Peak|Taper|Recovery Week>",
      "focus": "<1 sentence week focus>",
      "totalDistance": <km for running plans, 0 for strength>,
      "weeklyTips": "<specific tip for this week>",
      "workouts": [
        {
          "day": 0,
          "dayName": "Sunday",
          "type": "<run|lift|cardio|cross-training|yoga|rest>",
          "name": "<specific workout name e.g., 'Long Aerobic Run' or 'Upper Body Push Day'>",
          "duration": <total minutes>,
          "distance": <km if applicable, null otherwise>,
          "intensity": "<easy|moderate|hard|very_hard>",
          "targetHeartRate": "<Zone 1-5 or BPM range if applicable>",
          "warmUp": "<specific 5-10 min warm-up routine>",
          "mainWorkout": "<DETAILED workout - for runs: pace/zones, for lifts: exercises with sets/reps>",
          "coolDown": "<specific cool-down routine>",
          "coachingNotes": "<technique tips, what to focus on, common mistakes to avoid>",
          "equipmentNeeded": "<any equipment needed>"
        }
      ]
    }
  ],
  "tips": [
    "<actionable training tip>",
    "<nutrition/recovery tip>",
    "<mindset/motivation tip>",
    "<injury prevention tip>"
  ],
  "nutritionGuidance": "<brief daily nutrition advice for this plan type>",
  "recoveryProtocol": "<recommended recovery activities between sessions>"
}

EXAMPLE WORKOUT DETAIL:
"mainWorkout": "4x800m intervals at 5K race pace (approx 4:30-4:45/km). Take 2 min easy jog recovery between each interval. Focus on consistent pacing - first 400m should feel controlled, second 400m push to finish strong."

Be specific, prescriptive, and actionable. Reference athlete's history when setting paces/weights.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    });
    
    const text = completion.choices[0]?.message?.content || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        aiGenerated: true,
        ...parsed
      };
    }
    
    return generateFallbackPlan(type, difficulty, duration);
  } catch (error) {
    console.error('AI Plan Generation Error:', error);
    return generateFallbackPlan(type, difficulty, duration);
  }
};

// Prepare workout history for AI analysis
function prepareHistoryForPlan(workouts) {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      avgWorkoutsPerWeek: 0,
      primaryType: 'mixed',
      avgDuration: 0,
      maxDistance: 0,
      avgRpe: 5
    };
  }
  
  const now = new Date();
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= sixtyDaysAgo);
  
  const typeCount = {};
  let totalDuration = 0;
  let maxDistance = 0;
  let totalRpe = 0;
  let rpeCount = 0;
  
  recentWorkouts.forEach(w => {
    typeCount[w.type] = (typeCount[w.type] || 0) + 1;
    totalDuration += w.duration || 0;
    
    if (w.type === 'run' && w.run?.distance) {
      maxDistance = Math.max(maxDistance, w.run.distance);
    }
    
    if (w.rpe) {
      totalRpe += w.rpe;
      rpeCount++;
    }
  });
  
  const primaryType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
  
  return {
    totalWorkouts: recentWorkouts.length,
    avgWorkoutsPerWeek: Math.round(recentWorkouts.length / 8.5 * 10) / 10,
    primaryType,
    typeBreakdown: typeCount,
    avgDuration: recentWorkouts.length > 0 ? Math.round(totalDuration / recentWorkouts.length) : 0,
    maxDistance: Math.round(maxDistance * 10) / 10,
    avgRpe: rpeCount > 0 ? Math.round(totalRpe / rpeCount * 10) / 10 : 5
  };
}

function getPlanDescription(type) {
  const descriptions = {
    '5k': 'Training for a 5K race, focus on building base and speed',
    '10k': 'Training for a 10K race, building endurance and tempo',
    'half_marathon': 'Half marathon preparation with long runs and progressive mileage',
    'marathon': 'Full marathon training with peak mileage weeks',
    'general_fitness': 'Overall fitness improvement with mixed training',
    'strength': 'Muscle building and strength development'
  };
  return descriptions[type] || descriptions.general_fitness;
}

// Fallback plan when AI is not available
function generateFallbackPlan(type, difficulty, duration) {
  const intensityMultiplier = {
    beginner: 0.7,
    intermediate: 1.0,
    advanced: 1.3
  }[difficulty] || 1.0;
  
  const weeks = [];
  
  for (let i = 0; i < duration; i++) {
    const weekNumber = i + 1;
    let theme = 'Build';
    if (weekNumber <= 2) theme = 'Base Building';
    else if (weekNumber === duration - 1) theme = 'Taper';
    else if (weekNumber === duration) theme = 'Race Week';
    else if (weekNumber % 4 === 0) theme = 'Recovery';
    
    const workouts = type === 'strength' 
      ? generateStrengthWeek(intensityMultiplier)
      : generateRunningWeek(weekNumber, duration, intensityMultiplier);
    
    weeks.push({
      weekNumber,
      theme,
      totalDistance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      workouts
    });
  }
  
  return {
    success: true,
    aiGenerated: false,
    planName: `${type.replace('_', ' ').toUpperCase()} Training Plan`,
    weeklyOverview: 'This plan progressively builds your fitness with structured workouts and recovery periods.',
    weeks,
    tips: [
      'Listen to your body and take extra rest if needed',
      'Stay hydrated and fuel properly before long workouts',
      'Track your progress to stay motivated'
    ]
  };
}

function generateRunningWeek(weekNumber, totalWeeks, multiplier) {
  const baseDistance = (15 + weekNumber * 2) * multiplier;
  
  return [
    { 
      day: 0, dayName: 'Sunday', type: 'rest', name: 'Complete Rest', 
      duration: 0, distance: null, intensity: 'easy',
      warmUp: 'None required',
      mainWorkout: 'Take the day completely off. Focus on sleep, nutrition, and mental recovery.',
      coolDown: 'Optional: 10 min gentle stretching or foam rolling',
      coachingNotes: 'Rest days are when your body adapts and gets stronger. Resist the urge to do "just a little" workout.'
    },
    { 
      day: 1, dayName: 'Monday', type: 'run', name: 'Easy Aerobic Run', 
      duration: Math.round(30 * multiplier), distance: Math.round(baseDistance * 0.15 * 10) / 10, intensity: 'easy',
      targetHeartRate: 'Zone 2 (60-70% max HR)',
      warmUp: '5 min brisk walk, then 10 leg swings each leg, 10 arm circles',
      mainWorkout: `Run ${Math.round(baseDistance * 0.15 * 10) / 10}km at conversational pace. You should be able to speak full sentences. If breathing hard, slow down.`,
      coolDown: '5 min easy walk, then 5 min static stretching (quads, hamstrings, calves)',
      coachingNotes: 'Easy runs build aerobic base. Keep heart rate low - most runners go too fast on easy days.'
    },
    { 
      day: 2, dayName: 'Tuesday', type: 'cross-training', name: 'Cross Training', 
      duration: 40, distance: null, intensity: 'moderate',
      warmUp: '5 min light cardio (walking, cycling)',
      mainWorkout: 'Choose one: 30 min cycling at moderate effort, swimming laps for 20 min, or yoga flow class. Keep intensity conversational.',
      coolDown: '5 min stretching focusing on hips and shoulders',
      coachingNotes: 'Cross training reduces injury risk while maintaining fitness. Choose activities you enjoy!'
    },
    { 
      day: 3, dayName: 'Wednesday', type: 'run', name: 'Tempo Run', 
      duration: Math.round(35 * multiplier), distance: Math.round(baseDistance * 0.2 * 10) / 10, intensity: 'hard',
      targetHeartRate: 'Zone 4 (80-90% max HR)',
      warmUp: '10 min easy jog, dynamic stretches (high knees, butt kicks, leg swings)',
      mainWorkout: `15-20 min at tempo pace (comfortably hard - you can speak 3-4 words at a time). Target pace: ${Math.round((6 - multiplier * 0.5) * 10) / 10} min/km. Stay relaxed, shoulders down.`,
      coolDown: '10 min easy jog, then thorough stretching',
      coachingNotes: 'Tempo runs improve lactate threshold. Start conservatively - it should feel "comfortably uncomfortable".'
    },
    { 
      day: 4, dayName: 'Thursday', type: 'run', name: 'Recovery Run', 
      duration: Math.round(25 * multiplier), distance: Math.round(baseDistance * 0.12 * 10) / 10, intensity: 'easy',
      targetHeartRate: 'Zone 1-2 (under 65% max HR)',
      warmUp: '3 min walk to loosen up',
      mainWorkout: `Very easy ${Math.round(baseDistance * 0.12 * 10) / 10}km. This should feel almost too slow. Focus on smooth, relaxed form.`,
      coolDown: '5 min walk, foam rolling quads and calves',
      coachingNotes: 'Recovery runs promote blood flow for healing. If legs feel heavy, walk more or skip entirely.'
    },
    { 
      day: 5, dayName: 'Friday', type: 'lift', name: 'Runner Strength', 
      duration: 40, distance: null, intensity: 'moderate',
      warmUp: '5 min light cardio, 10 bodyweight squats, 10 walking lunges',
      mainWorkout: '3x12 Goblet Squats, 3x10 Romanian Deadlifts, 3x12 each leg Step-ups, 3x15 Calf Raises, 3x30sec Planks, 3x12 Dead Bugs. Rest 60-90 sec between sets.',
      coolDown: '5 min stretching - hip flexors, hamstrings, glutes',
      coachingNotes: 'Strength training prevents injuries and improves running economy. Focus on controlled movements, not heavy weights.',
      equipmentNeeded: 'Dumbbells or kettlebell, step/box'
    },
    { 
      day: 6, dayName: 'Saturday', type: 'run', name: 'Long Run', 
      duration: Math.round(60 * multiplier), distance: Math.round(baseDistance * 0.35 * 10) / 10, intensity: 'moderate',
      targetHeartRate: 'Zone 2-3 (65-75% max HR)',
      warmUp: '10 min easy walk/jog, dynamic stretches',
      mainWorkout: `${Math.round(baseDistance * 0.35 * 10) / 10}km at easy-to-moderate pace. Start slower than you think. Practice fueling if over 60 min (water, gels). Last 10 min can be slightly faster if feeling good.`,
      coolDown: '10 min walk, thorough stretching (10+ min), consider ice bath or cold shower for legs',
      coachingNotes: 'Long runs build endurance and mental toughness. Hydrate well the day before. Eat a familiar breakfast 2-3 hours before.',
      equipmentNeeded: 'Water bottle or hydration pack for runs over 60 min'
    }
  ];
}

function generateStrengthWeek(multiplier) {
  return [
    { 
      day: 0, dayName: 'Sunday', type: 'rest', name: 'Active Recovery', 
      duration: 30, distance: null, intensity: 'easy',
      warmUp: 'None required',
      mainWorkout: '20-30 min light activity: walking, gentle yoga, or swimming. Focus on mobility work - 5 min foam rolling major muscle groups.',
      coolDown: '10 min stretching routine',
      coachingNotes: 'Active recovery promotes blood flow and reduces soreness. Keep it truly light - this is not a workout day.'
    },
    { 
      day: 1, dayName: 'Monday', type: 'lift', name: 'Push Day (Chest/Shoulders/Triceps)', 
      duration: Math.round(50 * multiplier), distance: null, intensity: 'hard',
      warmUp: '5 min cardio, arm circles, band pull-aparts, 2 sets light bench press',
      mainWorkout: 'Bench Press 4x8, Overhead Press 3x10, Incline DB Press 3x12, Lateral Raises 3x15, Tricep Pushdowns 3x12, Dips 3x8-12. Rest 90-120 sec between compound lifts, 60 sec for isolation.',
      coolDown: '5 min stretching - chest, shoulders, triceps',
      coachingNotes: 'Control the eccentric (lowering). Keep core braced on pressing movements. If a weight feels too light at 8 reps, increase next week.',
      equipmentNeeded: 'Barbell, dumbbells, cable machine, dip bars'
    },
    { 
      day: 2, dayName: 'Tuesday', type: 'cardio', name: 'LISS Cardio', 
      duration: 30, distance: null, intensity: 'easy',
      warmUp: '2 min very easy',
      mainWorkout: '25-30 min steady-state cardio at 60-70% max HR. Options: incline treadmill walk, cycling, elliptical, rowing. Should be able to hold a conversation.',
      coolDown: '3 min easy, then stretch',
      coachingNotes: 'Light cardio aids recovery and cardiovascular health without impacting muscle gains. Keep it easy!'
    },
    { 
      day: 3, dayName: 'Wednesday', type: 'lift', name: 'Pull Day (Back/Biceps)', 
      duration: Math.round(50 * multiplier), distance: null, intensity: 'hard',
      warmUp: '5 min cardio, band pull-aparts, face pulls, 2 easy sets of lat pulldowns',
      mainWorkout: 'Deadlifts or RDL 4x6, Barbell Rows 4x8, Lat Pulldowns 3x12, Seated Cable Rows 3x12, Face Pulls 3x15, Barbell Curls 3x10, Hammer Curls 3x12. Rest 2-3 min after deadlifts, 90 sec others.',
      coolDown: 'Dead hangs 3x30 sec, lat and bicep stretches',
      coachingNotes: 'Squeeze shoulder blades on all pulling movements. Keep lower back neutral on rows. Deadlift form is critical - video yourself.',
      equipmentNeeded: 'Barbell, dumbbells, cable machine, pull-up bar'
    },
    { 
      day: 4, dayName: 'Thursday', type: 'rest', name: 'Complete Rest', 
      duration: 0, distance: null, intensity: 'easy',
      warmUp: 'None',
      mainWorkout: 'Full rest day. Focus on sleep (aim for 8+ hours) and nutrition (hit protein target: 1.6-2g per kg bodyweight).',
      coolDown: 'Optional foam rolling before bed',
      coachingNotes: 'Muscles grow during rest, not during workouts. Use this day to meal prep for the week ahead.'
    },
    { 
      day: 5, dayName: 'Friday', type: 'lift', name: 'Leg Day', 
      duration: Math.round(55 * multiplier), distance: null, intensity: 'hard',
      warmUp: '5 min cycling, leg swings, bodyweight squats, 2 warm-up sets of squats',
      mainWorkout: 'Back Squats 4x8, Romanian Deadlifts 3x10, Leg Press 3x12, Walking Lunges 3x10 each, Leg Curls 3x12, Calf Raises 4x15, Hanging Leg Raises 3x12. Rest 2-3 min for squats/RDL, 90 sec others.',
      coolDown: '10 min stretching - quads, hamstrings, hip flexors, glutes',
      coachingNotes: 'Squat depth matters - aim for thighs parallel or below. Drive through whole foot. This is the hardest day - fuel well beforehand.',
      equipmentNeeded: 'Squat rack, barbell, leg press, dumbbells'
    },
    { 
      day: 6, dayName: 'Saturday', type: 'lift', name: 'Upper Hypertrophy', 
      duration: Math.round(45 * multiplier), distance: null, intensity: 'moderate',
      warmUp: '5 min cardio, arm circles, light push-ups',
      mainWorkout: 'Incline DB Press 3x12, Cable Flys 3x15, Arnold Press 3x12, Rear Delt Flys 3x15, Tricep Overhead Extension 3x12, Preacher Curls 3x12, Shrugs 3x15. Rest 60-90 sec. Focus on mind-muscle connection and controlled tempo.',
      coolDown: 'Full upper body stretch routine',
      coachingNotes: 'Moderate day - use lighter weights and focus on feeling the muscle work. This is a great day to try new exercises.',
      equipmentNeeded: 'Dumbbells, cables, preacher curl bench'
    }
  ];
}

export default { analyzePerformance, generateChatResponse, generatePersonalizedPlan };
