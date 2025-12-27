import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Moon, 
  Scale, 
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/ui';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    age: user?.profile?.age || '',
    sport: user?.profile?.sport || 'running',
    fitnessLevel: user?.profile?.fitnessLevel || 'intermediate',
    weeklyGoalHours: user?.profile?.weeklyGoalHours || 5,
    units: user?.preferences?.units || 'metric',
    notifications: user?.preferences?.notifications ?? true
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };
  
  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      name: formData.name,
      profile: {
        height: parseFloat(formData.height) || undefined,
        weight: parseFloat(formData.weight) || undefined,
        age: parseInt(formData.age) || undefined,
        sport: formData.sport,
        fitnessLevel: formData.fitnessLevel,
        weeklyGoalHours: parseFloat(formData.weeklyGoalHours) || 5
      },
      preferences: {
        units: formData.units,
        notifications: formData.notifications
      }
    });
    
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
            />
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
            />
            <Input
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Sport</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
              >
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="weightlifting">Weightlifting</option>
                <option value="crossfit">CrossFit</option>
                <option value="triathlon">Triathlon</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Level</label>
              <select
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="elite">Elite</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Weekly Training Goal (hours)"
            name="weeklyGoalHours"
            type="number"
            step="0.5"
            value={formData.weeklyGoalHours}
            onChange={handleChange}
          />
        </div>
      </Card>
      
      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-lime-500" />
          </div>
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Units</label>
            <div className="flex gap-4">
              {['metric', 'imperial'].map((unit) => (
                <label key={unit} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="units"
                    value={unit}
                    checked={formData.units === unit}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 bg-dark-200 border-gray-600"
                  />
                  <span className="text-gray-300 capitalize">{unit}</span>
                </label>
              ))}
            </div>
          </div>
          
          <label className="flex items-center justify-between p-4 rounded-xl bg-dark-200/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Notifications</p>
                <p className="text-sm text-gray-400">Receive training reminders</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="w-5 h-5 rounded text-primary-500 bg-dark-200 border-gray-600"
            />
          </label>
        </div>
      </Card>
      
      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          variant={saved ? 'lime' : 'primary'}
          icon={saved ? Check : Save}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </motion.div>
    </div>
  );
}
