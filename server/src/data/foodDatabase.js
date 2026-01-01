// Common Foods Database with Nutritional Information
// All values per serving/standard unit

export const FOODS = [
  // Proteins
  { id: 'chicken_breast', name: 'Chicken Breast', category: 'protein', servingSize: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'chicken_thigh', name: 'Chicken Thigh', category: 'protein', servingSize: 100, unit: 'g', calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
  { id: 'beef_lean', name: 'Lean Beef', category: 'protein', servingSize: 100, unit: 'g', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  { id: 'salmon', name: 'Salmon', category: 'protein', servingSize: 100, unit: 'g', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { id: 'tuna', name: 'Tuna (canned)', category: 'protein', servingSize: 100, unit: 'g', calories: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0 },
  { id: 'eggs', name: 'Eggs (whole)', category: 'protein', servingSize: 1, unit: 'piece', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { id: 'egg_whites', name: 'Egg Whites', category: 'protein', servingSize: 100, unit: 'g', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 'turkey_breast', name: 'Turkey Breast', category: 'protein', servingSize: 100, unit: 'g', calories: 135, protein: 30, carbs: 0, fat: 0.7, fiber: 0 },
  { id: 'shrimp', name: 'Shrimp', category: 'protein', servingSize: 100, unit: 'g', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: 'tofu', name: 'Tofu (firm)', category: 'protein', servingSize: 100, unit: 'g', calories: 144, protein: 17, carbs: 3, fat: 8, fiber: 2 },
  { id: 'tempeh', name: 'Tempeh', category: 'protein', servingSize: 100, unit: 'g', calories: 192, protein: 20, carbs: 8, fat: 11, fiber: 0 },
  { id: 'paneer', name: 'Paneer', category: 'protein', servingSize: 100, unit: 'g', calories: 265, protein: 18, carbs: 1.2, fat: 21, fiber: 0 },
  
  // Grains & Carbs
  { id: 'brown_rice', name: 'Brown Rice (cooked)', category: 'carbs', servingSize: 100, unit: 'g', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
  { id: 'white_rice', name: 'White Rice (cooked)', category: 'carbs', servingSize: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: 'quinoa', name: 'Quinoa (cooked)', category: 'carbs', servingSize: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { id: 'oats', name: 'Oats (dry)', category: 'carbs', servingSize: 40, unit: 'g', calories: 152, protein: 5.3, carbs: 27, fat: 2.8, fiber: 4 },
  { id: 'whole_wheat_bread', name: 'Whole Wheat Bread', category: 'carbs', servingSize: 1, unit: 'piece', calories: 81, protein: 4, carbs: 14, fat: 1.1, fiber: 2 },
  { id: 'pasta', name: 'Pasta (cooked)', category: 'carbs', servingSize: 100, unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { id: 'sweet_potato', name: 'Sweet Potato', category: 'carbs', servingSize: 100, unit: 'g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
  { id: 'potato', name: 'Potato (boiled)', category: 'carbs', servingSize: 100, unit: 'g', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8 },
  { id: 'roti', name: 'Roti/Chapati', category: 'carbs', servingSize: 1, unit: 'piece', calories: 104, protein: 3, carbs: 18, fat: 3, fiber: 2 },
  { id: 'paratha', name: 'Paratha', category: 'carbs', servingSize: 1, unit: 'piece', calories: 260, protein: 5, carbs: 32, fat: 12, fiber: 2 },
  
  // Dairy
  { id: 'milk_whole', name: 'Whole Milk', category: 'dairy', servingSize: 240, unit: 'ml', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0 },
  { id: 'milk_skim', name: 'Skim Milk', category: 'dairy', servingSize: 240, unit: 'ml', calories: 83, protein: 8, carbs: 12, fat: 0.2, fiber: 0 },
  { id: 'greek_yogurt', name: 'Greek Yogurt', category: 'dairy', servingSize: 150, unit: 'g', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
  { id: 'curd', name: 'Curd/Dahi', category: 'dairy', servingSize: 100, unit: 'g', calories: 98, protein: 11, carbs: 3, fat: 4.3, fiber: 0 },
  { id: 'cottage_cheese', name: 'Cottage Cheese', category: 'dairy', servingSize: 100, unit: 'g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: 'cheese_cheddar', name: 'Cheddar Cheese', category: 'dairy', servingSize: 30, unit: 'g', calories: 120, protein: 7, carbs: 0.4, fat: 10, fiber: 0 },
  { id: 'whey_protein', name: 'Whey Protein', category: 'dairy', servingSize: 30, unit: 'g', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  
  // Fruits
  { id: 'banana', name: 'Banana', category: 'fruit', servingSize: 1, unit: 'piece', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
  { id: 'apple', name: 'Apple', category: 'fruit', servingSize: 1, unit: 'piece', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { id: 'orange', name: 'Orange', category: 'fruit', servingSize: 1, unit: 'piece', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1 },
  { id: 'mango', name: 'Mango', category: 'fruit', servingSize: 100, unit: 'g', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { id: 'grapes', name: 'Grapes', category: 'fruit', servingSize: 100, unit: 'g', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { id: 'watermelon', name: 'Watermelon', category: 'fruit', servingSize: 100, unit: 'g', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  { id: 'papaya', name: 'Papaya', category: 'fruit', servingSize: 100, unit: 'g', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  { id: 'mixed_berries', name: 'Mixed Berries', category: 'fruit', servingSize: 100, unit: 'g', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2 },
  
  // Vegetables
  { id: 'broccoli', name: 'Broccoli', category: 'vegetable', servingSize: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: 'spinach', name: 'Spinach', category: 'vegetable', servingSize: 100, unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: 'carrots', name: 'Carrots', category: 'vegetable', servingSize: 100, unit: 'g', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: 'tomatoes', name: 'Tomatoes', category: 'vegetable', servingSize: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetable', servingSize: 100, unit: 'g', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: 'bell_pepper', name: 'Bell Pepper', category: 'vegetable', servingSize: 100, unit: 'g', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: 'onion', name: 'Onion', category: 'vegetable', servingSize: 100, unit: 'g', calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  { id: 'cauliflower', name: 'Cauliflower', category: 'vegetable', servingSize: 100, unit: 'g', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  { id: 'mixed_salad', name: 'Mixed Salad', category: 'vegetable', servingSize: 100, unit: 'g', calories: 20, protein: 1.2, carbs: 3.3, fat: 0.2, fiber: 1.8 },
  
  // Legumes
  { id: 'dal', name: 'Dal (cooked)', category: 'legume', servingSize: 100, unit: 'g', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  { id: 'chickpeas', name: 'Chickpeas (cooked)', category: 'legume', servingSize: 100, unit: 'g', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  { id: 'lentils', name: 'Lentils (cooked)', category: 'legume', servingSize: 100, unit: 'g', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
  { id: 'kidney_beans', name: 'Kidney Beans', category: 'legume', servingSize: 100, unit: 'g', calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6.4 },
  { id: 'black_beans', name: 'Black Beans', category: 'legume', servingSize: 100, unit: 'g', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7 },
  
  // Nuts & Seeds
  { id: 'almonds', name: 'Almonds', category: 'nuts', servingSize: 30, unit: 'g', calories: 173, protein: 6, carbs: 6, fat: 15, fiber: 3.5 },
  { id: 'walnuts', name: 'Walnuts', category: 'nuts', servingSize: 30, unit: 'g', calories: 196, protein: 4.6, carbs: 4, fat: 19.5, fiber: 2 },
  { id: 'cashews', name: 'Cashews', category: 'nuts', servingSize: 30, unit: 'g', calories: 165, protein: 5.2, carbs: 9, fat: 13, fiber: 1 },
  { id: 'peanuts', name: 'Peanuts', category: 'nuts', servingSize: 30, unit: 'g', calories: 170, protein: 7.7, carbs: 5, fat: 14, fiber: 2.5 },
  { id: 'peanut_butter', name: 'Peanut Butter', category: 'nuts', servingSize: 2, unit: 'tbsp', calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2 },
  { id: 'chia_seeds', name: 'Chia Seeds', category: 'nuts', servingSize: 15, unit: 'g', calories: 73, protein: 2.5, carbs: 6, fat: 4.6, fiber: 5.2 },
  { id: 'flax_seeds', name: 'Flax Seeds', category: 'nuts', servingSize: 15, unit: 'g', calories: 80, protein: 2.7, carbs: 4.3, fat: 6.3, fiber: 4.1 },
  
  // Fats & Oils
  { id: 'olive_oil', name: 'Olive Oil', category: 'fat', servingSize: 1, unit: 'tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
  { id: 'coconut_oil', name: 'Coconut Oil', category: 'fat', servingSize: 1, unit: 'tbsp', calories: 121, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
  { id: 'butter', name: 'Butter', category: 'fat', servingSize: 1, unit: 'tbsp', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0 },
  { id: 'ghee', name: 'Ghee', category: 'fat', servingSize: 1, unit: 'tbsp', calories: 112, protein: 0, carbs: 0, fat: 12.7, fiber: 0 },
  { id: 'avocado', name: 'Avocado', category: 'fat', servingSize: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  
  // Beverages
  { id: 'coffee_black', name: 'Black Coffee', category: 'beverage', servingSize: 240, unit: 'ml', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { id: 'green_tea', name: 'Green Tea', category: 'beverage', servingSize: 240, unit: 'ml', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { id: 'coconut_water', name: 'Coconut Water', category: 'beverage', servingSize: 240, unit: 'ml', calories: 46, protein: 1.7, carbs: 9, fat: 0.5, fiber: 2.6 },
  { id: 'orange_juice', name: 'Orange Juice', category: 'beverage', servingSize: 240, unit: 'ml', calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5 },
  { id: 'smoothie_protein', name: 'Protein Smoothie', category: 'beverage', servingSize: 300, unit: 'ml', calories: 200, protein: 25, carbs: 20, fat: 3, fiber: 3 },
  
  // Snacks & Others
  { id: 'dark_chocolate', name: 'Dark Chocolate', category: 'snack', servingSize: 30, unit: 'g', calories: 170, protein: 2, carbs: 13, fat: 12, fiber: 3 },
  { id: 'protein_bar', name: 'Protein Bar', category: 'snack', servingSize: 1, unit: 'piece', calories: 200, protein: 20, carbs: 22, fat: 6, fiber: 3 },
  { id: 'honey', name: 'Honey', category: 'snack', servingSize: 1, unit: 'tbsp', calories: 64, protein: 0.1, carbs: 17, fat: 0, fiber: 0 },
  { id: 'rice_cakes', name: 'Rice Cakes', category: 'snack', servingSize: 2, unit: 'piece', calories: 70, protein: 1.4, carbs: 15, fat: 0.5, fiber: 0.4 },
  { id: 'popcorn', name: 'Popcorn (plain)', category: 'snack', servingSize: 30, unit: 'g', calories: 110, protein: 3, carbs: 22, fat: 1.3, fiber: 4 }
];

// Food categories with icons
export const FOOD_CATEGORIES = [
  { id: 'protein', name: 'Protein', icon: '🍖' },
  { id: 'carbs', name: 'Carbs', icon: '🍚' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'fruit', name: 'Fruits', icon: '🍎' },
  { id: 'vegetable', name: 'Vegetables', icon: '🥦' },
  { id: 'legume', name: 'Legumes', icon: '🫘' },
  { id: 'nuts', name: 'Nuts & Seeds', icon: '🥜' },
  { id: 'fat', name: 'Fats & Oils', icon: '🫒' },
  { id: 'beverage', name: 'Beverages', icon: '🥤' },
  { id: 'snack', name: 'Snacks', icon: '🍫' }
];

// Quick meal templates
export const MEAL_TEMPLATES = [
  {
    id: 'healthy_breakfast',
    name: 'Healthy Breakfast',
    description: 'Oats with banana and almonds',
    foods: [
      { ...FOODS.find(f => f.id === 'oats'), quantity: 40 },
      { ...FOODS.find(f => f.id === 'banana'), quantity: 1 },
      { ...FOODS.find(f => f.id === 'almonds'), quantity: 15 },
      { ...FOODS.find(f => f.id === 'milk_skim'), quantity: 200 }
    ]
  },
  {
    id: 'protein_rich_lunch',
    name: 'Protein-Rich Lunch',
    description: 'Chicken breast with rice and vegetables',
    foods: [
      { ...FOODS.find(f => f.id === 'chicken_breast'), quantity: 150 },
      { ...FOODS.find(f => f.id === 'brown_rice'), quantity: 150 },
      { ...FOODS.find(f => f.id === 'broccoli'), quantity: 100 },
      { ...FOODS.find(f => f.id === 'olive_oil'), quantity: 1 }
    ]
  },
  {
    id: 'post_workout_shake',
    name: 'Post-Workout Shake',
    description: 'Whey protein with banana',
    foods: [
      { ...FOODS.find(f => f.id === 'whey_protein'), quantity: 30 },
      { ...FOODS.find(f => f.id === 'banana'), quantity: 1 },
      { ...FOODS.find(f => f.id === 'milk_skim'), quantity: 250 }
    ]
  },
  {
    id: 'indian_dal_dinner',
    name: 'Indian Dal Dinner',
    description: 'Dal with roti and salad',
    foods: [
      { ...FOODS.find(f => f.id === 'dal'), quantity: 150 },
      { ...FOODS.find(f => f.id === 'roti'), quantity: 2 },
      { ...FOODS.find(f => f.id === 'mixed_salad'), quantity: 100 },
      { ...FOODS.find(f => f.id === 'ghee'), quantity: 1 }
    ]
  }
];

// Search foods by name
export function searchFoods(query) {
  const lowerQuery = query.toLowerCase();
  return FOODS.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  );
}

// Get foods by category
export function getFoodsByCategory(category) {
  return FOODS.filter(food => food.category === category);
}

export default {
  FOODS,
  FOOD_CATEGORIES,
  MEAL_TEMPLATES,
  searchFoods,
  getFoodsByCategory
};
