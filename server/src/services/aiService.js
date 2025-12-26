import { GoogleGenerativeAI } from '@google/generative-ai';
import Workout from '../models/Workout.js';

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Analyze workouts and generate insights
export const analyzePerformance = async (userId, workouts) => {
  if (!genAI) {
    return generateMockInsights(workouts);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare workout summary for AI
    const workoutSummary = prepareWorkoutSummary(workouts);
    
    const prompt = `You are an elite sports performance coach and data analyst. Analyze the following workout data for an athlete and provide comprehensive insights.

WORKOUT DATA:
${JSON.stringify(workoutSummary, null, 2)}

Provide your analysis in the following JSON format:
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
  if (!genAI) {
    return {
      response: "I'm currently running in demo mode. To get AI-powered insights, please configure your Gemini API key. In the meantime, I can tell you that your training data shows good consistency!",
      suggestions: [
        "View your performance trends",
        "Log a new workout",
        "Export your training plan"
      ]
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an elite AI sports coach assistant named "Coach AI". You're friendly, motivational, and data-driven.

ATHLETE'S RECENT WORKOUT DATA:
${JSON.stringify(workoutContext, null, 2)}

ATHLETE'S MESSAGE: "${message}"

Respond as a knowledgeable sports coach would. Be:
- Encouraging and motivational
- Data-driven when referencing their workouts
- Specific with advice
- Brief but helpful (2-4 sentences max)

Also provide 2-3 suggested follow-up questions they might want to ask.

Format your response as JSON:
{
  "response": "<your response>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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

export default { analyzePerformance, generateChatResponse };
