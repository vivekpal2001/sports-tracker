import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Activity, 
  Dumbbell, 
  Heart, 
  Bike,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileUp,
  Check,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { workoutAPI } from '../services/api';

const WORKOUT_TYPES = [
  { id: 'run', name: 'Run', icon: Activity, color: 'lime' },
  { id: 'lift', name: 'Lift', icon: Dumbbell, color: 'orange' },
  { id: 'cardio', name: 'Cardio', icon: Bike, color: 'primary' },
  { id: 'biometrics', name: 'Biometrics', icon: Heart, color: 'crimson' },
];

const RPE_LABELS = [
  '', 'Very Light', 'Light', 'Light', 'Moderate', 
  'Moderate', 'Hard', 'Hard', 'Very Hard', 'Very Hard', 'Maximum'
];

export default function LogWorkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    type: 'run',
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    rpe: 5,
    notes: '',
    // Run fields
    run: {
      distance: '',
      pace: '',
      avgHeartRate: '',
      elevation: '',
      terrain: 'road',
      weather: 'sunny'
    },
    // Lift fields
    lift: {
      muscleGroup: 'full-body',
      exercises: [{ name: '', sets: 3, reps: 10, weight: '' }]
    },
    // Cardio fields
    cardio: {
      activity: 'cycling',
      distance: '',
      avgHeartRate: '',
      calories: ''
    },
    // Biometrics fields
    biometrics: {
      weight: '',
      sleepHours: '',
      sleepQuality: 'good',
      restingHeartRate: '',
      hrv: '',
      mood: 'good',
      stress: 5,
      hydration: '',
      soreness: 3
    }
  });
  
  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.lift.exercises];
    newExercises[index][field] = value;
    setFormData(prev => ({
      ...prev,
      lift: { ...prev.lift, exercises: newExercises }
    }));
  };
  
  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      lift: {
        ...prev.lift,
        exercises: [...prev.lift.exercises, { name: '', sets: 3, reps: 10, weight: '' }]
      }
    }));
  };
  
  const removeExercise = (index) => {
    if (formData.lift.exercises.length > 1) {
      const newExercises = formData.lift.exercises.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        lift: { ...prev.lift, exercises: newExercises }
      }));
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/gpx+xml': ['.gpx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
      }
    }
  });
  
  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setLoading(true);
    try {
      const response = await workoutAPI.upload(uploadedFile);
      if (response.data.success) {
        navigate('/dashboard/workouts');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    
    // Build workout data based on type
    const workoutData = {
      type: formData.type,
      title: formData.title || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Workout`,
      date: formData.date,
      duration: parseInt(formData.duration) || undefined,
      rpe: formData.rpe,
      notes: formData.notes
    };
    
    // Add type-specific data
    if (formData.type === 'run') {
      workoutData.run = {
        distance: parseFloat(formData.run.distance) || undefined,
        pace: parseFloat(formData.run.pace) || undefined,
        avgHeartRate: parseInt(formData.run.avgHeartRate) || undefined,
        elevation: parseInt(formData.run.elevation) || undefined,
        terrain: formData.run.terrain,
        weather: formData.run.weather
      };
    } else if (formData.type === 'lift') {
      workoutData.lift = {
        muscleGroup: formData.lift.muscleGroup,
        exercises: formData.lift.exercises.filter(e => e.name).map(e => ({
          ...e,
          sets: parseInt(e.sets),
          reps: parseInt(e.reps),
          weight: parseFloat(e.weight) || 0
        }))
      };
    } else if (formData.type === 'cardio') {
      workoutData.cardio = {
        activity: formData.cardio.activity,
        distance: parseFloat(formData.cardio.distance) || undefined,
        avgHeartRate: parseInt(formData.cardio.avgHeartRate) || undefined,
        calories: parseInt(formData.cardio.calories) || undefined
      };
    } else if (formData.type === 'biometrics') {
      workoutData.biometrics = {
        weight: parseFloat(formData.biometrics.weight) || undefined,
        sleepHours: parseFloat(formData.biometrics.sleepHours) || undefined,
        sleepQuality: formData.biometrics.sleepQuality,
        restingHeartRate: parseInt(formData.biometrics.restingHeartRate) || undefined,
        hrv: parseInt(formData.biometrics.hrv) || undefined,
        mood: formData.biometrics.mood,
        stress: formData.biometrics.stress,
        hydration: parseFloat(formData.biometrics.hydration) || undefined,
        soreness: formData.biometrics.soreness
      };
    }
    
    try {
      await workoutAPI.create(workoutData);
      navigate('/dashboard/workouts');
    } catch (error) {
      console.error('Failed to create workout:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const selectedType = WORKOUT_TYPES.find(t => t.id === formData.type);
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Log Workout</h1>
          <p className="text-gray-400">Record your training session</p>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            animate={{
              width: step === s ? 32 : 12,
              backgroundColor: step >= s ? '#00d4ff' : 'rgba(255,255,255,0.1)',
            }}
            className="h-3 rounded-full transition-colors"
          />
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {/* Step 1: Select Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card padding="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">What type of workout?</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {WORKOUT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`
                        p-6 rounded-2xl flex flex-col items-center gap-3 transition-all
                        ${isSelected 
                          ? 'bg-primary-500/20 border-2 border-primary-500' 
                          : 'bg-dark-200/50 border-2 border-transparent hover:border-white/20'}
                      `}
                    >
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center
                        ${type.color === 'lime' ? 'bg-lime-500/20' : ''}
                        ${type.color === 'orange' ? 'bg-orange-500/20' : ''}
                        ${type.color === 'primary' ? 'bg-primary-500/20' : ''}
                        ${type.color === 'crimson' ? 'bg-crimson-500/20' : ''}
                      `}>
                        <Icon className={`w-7 h-7 ${
                          type.color === 'lime' ? 'text-lime-500' : ''
                        }${type.color === 'orange' ? 'text-orange-500' : ''}
                        ${type.color === 'primary' ? 'text-primary-500' : ''}
                        ${type.color === 'crimson' ? 'text-crimson-500' : ''}`} />
                      </div>
                      <span className={isSelected ? 'text-primary-500 font-medium' : 'text-gray-300'}>
                        {type.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* File Upload */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">Or import from file:</p>
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-white/10 hover:border-white/20'}
                  `}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileUp className="w-8 h-8 text-lime-500" />
                      <div className="text-left">
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="ml-3 p-1 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Drop GPX or CSV file here</p>
                      <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                {uploadedFile ? (
                  <Button fullWidth onClick={handleUpload} loading={loading}>
                    Import File
                  </Button>
                ) : (
                  <Button fullWidth onClick={() => setStep(2)} icon={ArrowRight} iconPosition="right">
                    Continue
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card padding="p-8">
              <div className="flex items-center gap-3 mb-6">
                <selectedType.icon className={`w-6 h-6 text-${selectedType.color}-500`} />
                <h2 className="text-xl font-semibold text-white">{selectedType.name} Details</h2>
              </div>
              
              <div className="space-y-5">
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    name="title"
                    placeholder={`${selectedType.name} Workout`}
                    value={formData.title}
                    onChange={handleChange}
                  />
                  <Input
                    label="Date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                
                {formData.type !== 'biometrics' && (
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    name="duration"
                    placeholder="45"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                )}
                
                {/* Type-specific fields */}
                {formData.type === 'run' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Distance (km)"
                        type="number"
                        name="distance"
                        placeholder="5.0"
                        step="0.1"
                        value={formData.run.distance}
                        onChange={(e) => handleChange(e, 'run')}
                      />
                      <Input
                        label="Avg Heart Rate"
                        type="number"
                        name="avgHeartRate"
                        placeholder="145"
                        value={formData.run.avgHeartRate}
                        onChange={(e) => handleChange(e, 'run')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Terrain</label>
                        <select
                          name="terrain"
                          value={formData.run.terrain}
                          onChange={(e) => handleChange(e, 'run')}
                          className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
                        >
                          <option value="road">Road</option>
                          <option value="trail">Trail</option>
                          <option value="track">Track</option>
                          <option value="treadmill">Treadmill</option>
                        </select>
                      </div>
                      <Input
                        label="Elevation (m)"
                        type="number"
                        name="elevation"
                        placeholder="150"
                        value={formData.run.elevation}
                        onChange={(e) => handleChange(e, 'run')}
                      />
                    </div>
                  </>
                )}
                
                {formData.type === 'lift' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Muscle Group</label>
                      <select
                        name="muscleGroup"
                        value={formData.lift.muscleGroup}
                        onChange={(e) => handleChange(e, 'lift')}
                        className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
                      >
                        <option value="chest">Chest</option>
                        <option value="back">Back</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="arms">Arms</option>
                        <option value="legs">Legs</option>
                        <option value="core">Core</option>
                        <option value="full-body">Full Body</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Exercises</label>
                      {formData.lift.exercises.map((exercise, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder="Exercise name"
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(i, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            placeholder="Sets"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(i, 'sets', e.target.value)}
                            className="w-16 px-3 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white text-center"
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(i, 'reps', e.target.value)}
                            className="w-16 px-3 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white text-center"
                          />
                          <input
                            type="number"
                            placeholder="kg"
                            value={exercise.weight}
                            onChange={(e) => handleExerciseChange(i, 'weight', e.target.value)}
                            className="w-20 px-3 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white text-center"
                          />
                          <button
                            onClick={() => removeExercise(i)}
                            className="p-2 rounded-lg hover:bg-crimson-500/10 text-gray-400 hover:text-crimson-500"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addExercise}
                        className="flex items-center gap-2 text-primary-500 text-sm hover:text-primary-400"
                      >
                        <Plus className="w-4 h-4" />
                        Add Exercise
                      </button>
                    </div>
                  </>
                )}
                
                {formData.type === 'cardio' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Activity</label>
                      <select
                        name="activity"
                        value={formData.cardio.activity}
                        onChange={(e) => handleChange(e, 'cardio')}
                        className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
                      >
                        <option value="cycling">Cycling</option>
                        <option value="swimming">Swimming</option>
                        <option value="rowing">Rowing</option>
                        <option value="elliptical">Elliptical</option>
                        <option value="hiit">HIIT</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Distance (km)"
                        type="number"
                        name="distance"
                        value={formData.cardio.distance}
                        onChange={(e) => handleChange(e, 'cardio')}
                      />
                      <Input
                        label="Calories"
                        type="number"
                        name="calories"
                        value={formData.cardio.calories}
                        onChange={(e) => handleChange(e, 'cardio')}
                      />
                    </div>
                  </>
                )}
                
                {formData.type === 'biometrics' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Weight (kg)"
                        type="number"
                        name="weight"
                        step="0.1"
                        value={formData.biometrics.weight}
                        onChange={(e) => handleChange(e, 'biometrics')}
                      />
                      <Input
                        label="Sleep (hours)"
                        type="number"
                        name="sleepHours"
                        step="0.5"
                        value={formData.biometrics.sleepHours}
                        onChange={(e) => handleChange(e, 'biometrics')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
                        <select
                          name="mood"
                          value={formData.biometrics.mood}
                          onChange={(e) => handleChange(e, 'biometrics')}
                          className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
                        >
                          <option value="exhausted">Exhausted</option>
                          <option value="tired">Tired</option>
                          <option value="neutral">Neutral</option>
                          <option value="good">Good</option>
                          <option value="energized">Energized</option>
                        </select>
                      </div>
                      <Input
                        label="Resting HR"
                        type="number"
                        name="restingHeartRate"
                        value={formData.biometrics.restingHeartRate}
                        onChange={(e) => handleChange(e, 'biometrics')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="HRV"
                        type="number"
                        name="hrv"
                        value={formData.biometrics.hrv}
                        onChange={(e) => handleChange(e, 'biometrics')}
                      />
                      <Input
                        label="Hydration (L)"
                        type="number"
                        name="hydration"
                        step="0.1"
                        value={formData.biometrics.hydration}
                        onChange={(e) => handleChange(e, 'biometrics')}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-3 mt-8">
                <Button variant="ghost" onClick={() => setStep(1)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button fullWidth onClick={() => setStep(3)} icon={ArrowRight} iconPosition="right">
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Step 3: RPE & Notes */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card padding="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">How was the workout?</h2>
              
              {formData.type !== 'biometrics' && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Rate of Perceived Exertion (RPE)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.rpe}
                      onChange={(e) => setFormData({ ...formData, rpe: parseInt(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">1</span>
                      <span className="text-primary-500 font-medium">
                        {formData.rpe} - {RPE_LABELS[formData.rpe]}
                      </span>
                      <span className="text-gray-500">10</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="How did you feel? Any observations?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-primary-500"
                />
              </div>
              
              {/* Summary Preview */}
              <div className="p-4 rounded-xl bg-dark-200/50 mb-8">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Workout Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white">{selectedType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white">{formData.date}</span>
                  </div>
                  {formData.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{formData.duration} min</span>
                    </div>
                  )}
                  {formData.type === 'run' && formData.run.distance && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance</span>
                      <span className="text-white">{formData.run.distance} km</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button 
                  fullWidth 
                  variant="lime"
                  onClick={handleSubmit} 
                  loading={loading}
                  icon={Check}
                >
                  Save Workout
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
