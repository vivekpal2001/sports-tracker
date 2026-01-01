import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Plus, 
  Target,
  TrendingUp,
  Calendar,
  Search,
  X,
  Flame,
  Droplet,
  Apple,
  Beef,
  Wheat,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', color: 'orange' },
  { id: 'lunch', name: 'Lunch', icon: '☀️', color: 'lime' },
  { id: 'dinner', name: 'Dinner', icon: '🌙', color: 'primary' },
  { id: 'snack', name: 'Snack', icon: '🍎', color: 'crimson' },
  { id: 'pre-workout', name: 'Pre-Workout', icon: '⚡', color: 'yellow' },
  { id: 'post-workout', name: 'Post-Workout', icon: '💪', color: 'green' }
];

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [nutritionGoal, setNutritionGoal] = useState(null);
  
  useEffect(() => {
    fetchDailySummary();
    fetchNutritionGoal();
  }, [selectedDate]);
  
  const fetchDailySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/nutrition/summary/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDailySummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNutritionGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/nutrition/goal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNutritionGoal(data.data);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    }
  };
  
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const deleteMeal = async (mealId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/nutrition/meals/${mealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDailySummary();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UtensilsCrossed className="w-8 h-8 text-lime-500" />
            Nutrition
          </h1>
          <p className="text-gray-400 mt-1">Track your meals and macros</p>
        </div>
        <Button onClick={() => setShowLogModal(true)} icon={Plus} variant="lime">
          Log Meal
        </Button>
      </div>
      
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="px-6 py-3 rounded-xl bg-dark-200/50 min-w-[200px] text-center">
          <p className="text-white font-semibold">{formatDate(selectedDate)}</p>
          <p className="text-xs text-gray-400">{selectedDate}</p>
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400"
          disabled={selectedDate >= new Date().toISOString().split('T')[0]}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dark-200/50 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Macro Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MacroCard
              icon={Flame}
              label="Calories"
              current={dailySummary?.totals?.calories || 0}
              target={dailySummary?.targets?.calories || 2000}
              unit="kcal"
              color="orange"
            />
            <MacroCard
              icon={Beef}
              label="Protein"
              current={dailySummary?.totals?.protein || 0}
              target={dailySummary?.targets?.protein || 125}
              unit="g"
              color="crimson"
            />
            <MacroCard
              icon={Wheat}
              label="Carbs"
              current={dailySummary?.totals?.carbs || 0}
              target={dailySummary?.targets?.carbs || 250}
              unit="g"
              color="lime"
            />
            <MacroCard
              icon={Droplet}
              label="Fat"
              current={dailySummary?.totals?.fat || 0}
              target={dailySummary?.targets?.fat || 55}
              unit="g"
              color="primary"
            />
          </div>
          
          {/* Remaining */}
          {dailySummary?.remaining && (
            <Card padding="p-6" className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Remaining Today</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {dailySummary.remaining.calories}
                  </p>
                  <p className="text-sm text-gray-400">kcal</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-crimson-400">
                    {dailySummary.remaining.protein}g
                  </p>
                  <p className="text-sm text-gray-400">Protein</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-lime-400">
                    {dailySummary.remaining.carbs}g
                  </p>
                  <p className="text-sm text-gray-400">Carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-400">
                    {dailySummary.remaining.fat}g
                  </p>
                  <p className="text-sm text-gray-400">Fat</p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Meals by Type */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
            
            {dailySummary?.mealCount === 0 ? (
              <Card padding="p-12" className="text-center">
                <UtensilsCrossed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No meals logged</h3>
                <p className="text-gray-400 mb-6">Start tracking your nutrition today!</p>
                <Button onClick={() => setShowLogModal(true)} icon={Plus}>
                  Log Your First Meal
                </Button>
              </Card>
            ) : (
              MEAL_TYPES.map((mealType) => {
                const mealsOfType = dailySummary?.mealsByType?.[mealType.id] || [];
                if (mealsOfType.length === 0) return null;
                
                return (
                  <div key={mealType.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{mealType.icon}</span>
                      <h4 className="text-white font-medium">{mealType.name}</h4>
                      <span className="text-gray-400 text-sm">
                        ({mealsOfType.reduce((sum, m) => sum + m.totalCalories, 0)} kcal)
                      </span>
                    </div>
                    
                    {mealsOfType.map((meal) => (
                      <MealCard 
                        key={meal._id} 
                        meal={meal} 
                        onDelete={() => deleteMeal(meal._id)}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
      
      {/* Log Meal Modal */}
      <AnimatePresence>
        {showLogModal && (
          <LogMealModal
            onClose={() => setShowLogModal(false)}
            onSuccess={() => {
              setShowLogModal(false);
              fetchDailySummary();
            }}
            selectedDate={selectedDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Macro Card Component
function MacroCard({ icon: Icon, label, current, target, unit, color }) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const isOver = current > target;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-200/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-4 h-4 text-${color}-500`} />
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      
      <div className="mb-2">
        <span className={`text-2xl font-bold ${isOver ? 'text-crimson-400' : 'text-white'}`}>
          {current}
        </span>
        <span className="text-gray-400 text-sm"> / {target} {unit}</span>
      </div>
      
      <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full rounded-full ${
            isOver 
              ? 'bg-crimson-500' 
              : `bg-gradient-to-r from-${color}-500 to-${color}-400`
          }`}
        />
      </div>
      <p className={`text-xs mt-1 ${isOver ? 'text-crimson-400' : 'text-gray-400'}`}>
        {percent}% {isOver ? '(over)' : ''}
      </p>
    </motion.div>
  );
}

// Meal Card Component
function MealCard({ meal, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-dark-200/30 rounded-xl p-4 flex items-center gap-4"
    >
      <div className="flex-1">
        <h5 className="font-medium text-white">{meal.name}</h5>
        <p className="text-sm text-gray-400">
          {meal.foods?.length || 0} items • {meal.totalCalories} kcal
        </p>
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          <span>P: {meal.totalProtein}g</span>
          <span>C: {meal.totalCarbs}g</span>
          <span>F: {meal.totalFat}g</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="p-2 rounded-lg hover:bg-crimson-500/10 text-gray-400 hover:text-crimson-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Log Meal Modal
function LogMealModal({ onClose, onSuccess, selectedDate }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [formData, setFormData] = useState({
    type: 'breakfast',
    name: '',
    notes: ''
  });
  
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFoods();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  const searchFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/nutrition/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };
  
  const addFood = (food) => {
    setSelectedFoods(prev => [...prev, {
      ...food,
      quantity: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const removeFood = (index) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateFoodQuantity = (index, quantity) => {
    setSelectedFoods(prev => prev.map((food, i) => {
      if (i !== index) return food;
      const ratio = quantity / food.servingSize;
      return {
        ...food,
        quantity,
        calories: Math.round(food.calories * ratio),
        protein: Math.round(food.protein * ratio * 10) / 10,
        carbs: Math.round(food.carbs * ratio * 10) / 10,
        fat: Math.round(food.fat * ratio * 10) / 10
      };
    }));
  };
  
  const totalNutrients = selectedFoods.reduce((acc, food) => ({
    calories: acc.calories + (food.calories || 0),
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFoods.length === 0) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const mealType = MEAL_TYPES.find(t => t.id === formData.type);
      
      await fetch(`${API_URL}/api/nutrition/meals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          type: formData.type,
          name: formData.name || `${mealType.name}`,
          foods: selectedFoods,
          notes: formData.notes
        })
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error logging meal:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Log Meal</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Meal Type</label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.type === type.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <p className="text-xs text-gray-300 mt-1">{type.name}</p>
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label="Meal Name (optional)"
            placeholder="e.g., Healthy Breakfast"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          {/* Food Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Add Foods</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for foods..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-dark-200 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => addFood(food)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div>
                      <p className="text-white">{food.name}</p>
                      <p className="text-xs text-gray-400">
                        {food.servingSize}{food.unit} • {food.calories} kcal
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-primary-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Selected Foods ({selectedFoods.length})
              </label>
              {selectedFoods.map((food, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-dark-200/30 rounded-xl">
                  <div className="flex-1">
                    <p className="text-white text-sm">{food.name}</p>
                    <p className="text-xs text-gray-400">{food.calories} kcal</p>
                  </div>
                  <input
                    type="number"
                    value={food.quantity}
                    onChange={(e) => updateFoodQuantity(index, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded-lg bg-dark-300 border border-white/10 text-white text-center text-sm"
                  />
                  <span className="text-gray-400 text-sm">{food.unit}</span>
                  <button
                    type="button"
                    onClick={() => removeFood(index)}
                    className="p-1 hover:bg-crimson-500/10 rounded text-gray-400 hover:text-crimson-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Totals */}
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <div className="grid grid-cols-4 text-center text-sm">
                  <div>
                    <p className="text-orange-400 font-bold">{totalNutrients.calories}</p>
                    <p className="text-gray-400 text-xs">kcal</p>
                  </div>
                  <div>
                    <p className="text-crimson-400 font-bold">{totalNutrients.protein.toFixed(1)}g</p>
                    <p className="text-gray-400 text-xs">Protein</p>
                  </div>
                  <div>
                    <p className="text-lime-400 font-bold">{totalNutrients.carbs.toFixed(1)}g</p>
                    <p className="text-gray-400 text-xs">Carbs</p>
                  </div>
                  <div>
                    <p className="text-primary-400 font-bold">{totalNutrients.fat.toFixed(1)}g</p>
                    <p className="text-gray-400 text-xs">Fat</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading} 
              fullWidth
              disabled={selectedFoods.length === 0}
            >
              Log Meal
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
