import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['g', 'ml', 'oz', 'cup', 'piece', 'serving', 'tbsp', 'tsp'],
    default: 'g'
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  fat: {
    type: Number,
    default: 0,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  sugar: {
    type: Number,
    default: 0,
    min: 0
  },
  sodium: {
    type: Number,
    default: 0,
    min: 0
  }
});

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'],
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  foods: [foodItemSchema],
  
  // Calculated totals
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  totalFiber: {
    type: Number,
    default: 0
  },
  
  notes: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    default: ''
  },
  // For quick-add templates
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
mealSchema.index({ user: 1, date: -1 });
mealSchema.index({ user: 1, type: 1, date: -1 });

// Pre-save: calculate totals
mealSchema.pre('save', function(next) {
  if (this.foods && this.foods.length > 0) {
    this.totalCalories = this.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    this.totalProtein = this.foods.reduce((sum, f) => sum + (f.protein || 0), 0);
    this.totalCarbs = this.foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    this.totalFat = this.foods.reduce((sum, f) => sum + (f.fat || 0), 0);
    this.totalFiber = this.foods.reduce((sum, f) => sum + (f.fiber || 0), 0);
  }
  next();
});

// Virtual for macro percentages
mealSchema.virtual('macroPercentages').get(function() {
  const total = (this.totalProtein * 4) + (this.totalCarbs * 4) + (this.totalFat * 9);
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  
  return {
    protein: Math.round((this.totalProtein * 4 / total) * 100),
    carbs: Math.round((this.totalCarbs * 4 / total) * 100),
    fat: Math.round((this.totalFat * 9 / total) * 100)
  };
});

// Ensure virtuals are included
mealSchema.set('toJSON', { virtuals: true });
mealSchema.set('toObject', { virtuals: true });

// Static: Get meal type emoji
mealSchema.statics.getMealTypeInfo = function(type) {
  const types = {
    breakfast: { icon: '🌅', name: 'Breakfast', color: 'orange' },
    lunch: { icon: '☀️', name: 'Lunch', color: 'lime' },
    dinner: { icon: '🌙', name: 'Dinner', color: 'primary' },
    snack: { icon: '🍎', name: 'Snack', color: 'crimson' },
    'pre-workout': { icon: '⚡', name: 'Pre-Workout', color: 'yellow' },
    'post-workout': { icon: '💪', name: 'Post-Workout', color: 'green' }
  };
  return types[type] || types.snack;
};

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
