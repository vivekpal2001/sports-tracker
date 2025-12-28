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
    
    const prompt = `You are an elite sports coach creating a personalized ${duration}-week training plan.

ATHLETE PROFILE:
- Plan Type: ${type} (${getPlanDescription(type)})
- Experience Level: ${difficulty}
- Goal: ${goal || `Complete ${type} training`}
- Recovery Score: ${recoveryScore || 75}/100

RECENT TRAINING HISTORY (Last 60 days):
${JSON.stringify(historySummary, null, 2)}

Generate a detailed ${duration}-week training plan. For each week, provide 7 days of workouts.

IMPORTANT RULES:
1. If recovery score < 50, reduce intensity and add more rest days
2. Base workout difficulty on their actual training history
3. Progressive overload - each week should build on the previous
4. Include 1 rest day minimum per week
5. For running plans: include easy runs, tempo runs, intervals, and long runs
6. For strength plans: include upper body, lower body, and full body days

Output ONLY valid JSON in this exact format:
{
  "planName": "<personalized plan name>",
  "weeklyOverview": "<2 sentence overview of the plan structure>",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "<Build Base|Speed Work|Peak|Taper|Recovery>",
      "totalDistance": <km for running plans, 0 for strength>,
      "workouts": [
        {
          "day": 0,
          "dayName": "Sunday",
          "type": "<run|lift|cardio|cross-training|rest>",
          "name": "<workout name>",
          "description": "<1-2 sentence description>",
          "duration": <minutes>,
          "distance": <km if applicable, null otherwise>,
          "intensity": "<easy|moderate|hard>"
        }
      ]
    }
  ],
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 4000,
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
    { day: 0, dayName: 'Sunday', type: 'rest', name: 'Rest Day', description: 'Full rest or light stretching', duration: 0, distance: null, intensity: 'easy' },
    { day: 1, dayName: 'Monday', type: 'run', name: 'Easy Run', description: 'Conversational pace', duration: Math.round(30 * multiplier), distance: Math.round(baseDistance * 0.15 * 10) / 10, intensity: 'easy' },
    { day: 2, dayName: 'Tuesday', type: 'cross-training', name: 'Cross Training', description: 'Cycling, swimming, or strength', duration: 40, distance: null, intensity: 'moderate' },
    { day: 3, dayName: 'Wednesday', type: 'run', name: 'Tempo Run', description: 'Comfortably hard pace', duration: Math.round(35 * multiplier), distance: Math.round(baseDistance * 0.2 * 10) / 10, intensity: 'hard' },
    { day: 4, dayName: 'Thursday', type: 'run', name: 'Easy Run', description: 'Recovery pace', duration: Math.round(25 * multiplier), distance: Math.round(baseDistance * 0.12 * 10) / 10, intensity: 'easy' },
    { day: 5, dayName: 'Friday', type: 'lift', name: 'Strength', description: 'Lower body and core focus', duration: 40, distance: null, intensity: 'moderate' },
    { day: 6, dayName: 'Saturday', type: 'run', name: 'Long Run', description: 'Build endurance at easy pace', duration: Math.round(60 * multiplier), distance: Math.round(baseDistance * 0.35 * 10) / 10, intensity: 'moderate' }
  ];
}

function generateStrengthWeek(multiplier) {
  return [
    { day: 0, dayName: 'Sunday', type: 'rest', name: 'Rest Day', description: 'Complete rest', duration: 0, distance: null, intensity: 'easy' },
    { day: 1, dayName: 'Monday', type: 'lift', name: 'Upper Body Push', description: 'Chest, shoulders, triceps', duration: Math.round(45 * multiplier), distance: null, intensity: 'hard' },
    { day: 2, dayName: 'Tuesday', type: 'cardio', name: 'Cardio', description: 'Light cardio for recovery', duration: 30, distance: null, intensity: 'easy' },
    { day: 3, dayName: 'Wednesday', type: 'lift', name: 'Lower Body', description: 'Squats, deadlifts, leg press', duration: Math.round(50 * multiplier), distance: null, intensity: 'hard' },
    { day: 4, dayName: 'Thursday', type: 'rest', name: 'Active Recovery', description: 'Stretching and mobility', duration: 20, distance: null, intensity: 'easy' },
    { day: 5, dayName: 'Friday', type: 'lift', name: 'Upper Body Pull', description: 'Back, biceps, rear delts', duration: Math.round(45 * multiplier), distance: null, intensity: 'hard' },
    { day: 6, dayName: 'Saturday', type: 'lift', name: 'Full Body', description: 'Compound movements', duration: Math.round(40 * multiplier), distance: null, intensity: 'moderate' }
  ];
}

export default { analyzePerformance, generateChatResponse, generatePersonalizedPlan };

