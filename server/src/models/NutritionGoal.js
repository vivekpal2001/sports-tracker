import mongoose from 'mongoose';

const nutritionGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  dailyCalories: {
    type: Number,
    required: true,
    min: 500,
    max: 10000,
    default: 2000
  },
  macroTargets: {
    protein: {
      type: Number,
      default: 25  // percentage
    },
    carbs: {
      type: Number,
      default: 50  // percentage
    },
    fat: {
      type: Number,
      default: 25  // percentage
    },
    // In grams (optional - if set, overrides percentage)
    proteinGrams: Number,
    carbsGrams: Number,
    fatGrams: Number
  },
  // Micro targets
  microTargets: {
    fiber: { type: Number, default: 25 },  // grams
    sugar: { type: Number, default: 50 },   // grams max
    sodium: { type: Number, default: 2300 } // mg max
  },
  waterTarget: {
    type: Number,
    default: 2.5,  // liters
    min: 0.5,
    max: 10
  },
  mealTiming: {
    breakfast: { enabled: { type: Boolean, default: true }, targetTime: String },
    lunch: { enabled: { type: Boolean, default: true }, targetTime: String },
    dinner: { enabled: { type: Boolean, default: true }, targetTime: String },
    snacks: { enabled: { type: Boolean, default: true }, count: { type: Number, default: 2 } }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  goalType: {
    type: String,
    enum: ['lose', 'maintain', 'gain', 'custom'],
    default: 'maintain'
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
    default: 'moderate'
  }
}, {
  timestamps: true
});

// Calculate macro grams from percentages
nutritionGoalSchema.virtual('macroGrams').get(function() {
  return {
    protein: this.macroTargets.proteinGrams || Math.round((this.dailyCalories * this.macroTargets.protein / 100) / 4),
    carbs: this.macroTargets.carbsGrams || Math.round((this.dailyCalories * this.macroTargets.carbs / 100) / 4),
    fat: this.macroTargets.fatGrams || Math.round((this.dailyCalories * this.macroTargets.fat / 100) / 9)
  };
});

// Calculate calories per meal
nutritionGoalSchema.virtual('caloriesPerMeal').get(function() {
  const meals = [];
  if (this.mealTiming.breakfast.enabled) meals.push('breakfast');
  if (this.mealTiming.lunch.enabled) meals.push('lunch');
  if (this.mealTiming.dinner.enabled) meals.push('dinner');
  
  const snackCals = this.mealTiming.snacks.enabled 
    ? (this.dailyCalories * 0.15)  // 15% for snacks
    : 0;
  
  const mealCals = (this.dailyCalories - snackCals) / meals.length;
  
  return {
    breakfast: Math.round(mealCals),
    lunch: Math.round(mealCals),
    dinner: Math.round(mealCals),
    snack: Math.round(snackCals / (this.mealTiming.snacks.count || 2))
  };
});

nutritionGoalSchema.set('toJSON', { virtuals: true });
nutritionGoalSchema.set('toObject', { virtuals: true });

// Static: Calculate recommended calories
nutritionGoalSchema.statics.calculateRecommendedCalories = function(weight, height, age, gender, activityLevel, goalType) {
  // Mifflin-St Jeor equation
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9
  };
  
  let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
  
  // Goal adjustments
  const goalAdjustments = {
    lose: -500,    // 0.5kg per week
    maintain: 0,
    gain: 300      // lean bulk
  };
  
  return Math.round(tdee + (goalAdjustments[goalType] || 0));
};

const NutritionGoal = mongoose.model('NutritionGoal', nutritionGoalSchema);

export default NutritionGoal;
