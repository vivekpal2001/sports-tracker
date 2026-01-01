// Yoga Poses Database
// Comprehensive list of yoga poses with difficulty levels and categories

export const YOGA_POSES = [
  // Standing Poses
  { id: 'mountain', name: 'Mountain Pose', sanskrit: 'Tadasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'core'] },
  { id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'core', 'balance'] },
  { id: 'warrior1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'hips', 'arms'] },
  { id: 'warrior2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'hips', 'arms'] },
  { id: 'warrior3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', difficulty: 'intermediate', category: 'standing', muscleGroups: ['legs', 'core', 'balance'] },
  { id: 'triangle', name: 'Triangle Pose', sanskrit: 'Trikonasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'hips', 'obliques'] },
  { id: 'extended_side_angle', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'hips', 'obliques'] },
  { id: 'half_moon', name: 'Half Moon Pose', sanskrit: 'Ardha Chandrasana', difficulty: 'intermediate', category: 'standing', muscleGroups: ['legs', 'core', 'balance'] },
  { id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['legs', 'glutes', 'core'] },
  { id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', difficulty: 'intermediate', category: 'standing', muscleGroups: ['legs', 'shoulders', 'balance'] },
  { id: 'standing_forward_fold', name: 'Standing Forward Fold', sanskrit: 'Uttanasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['hamstrings', 'back'] },
  { id: 'pyramid', name: 'Pyramid Pose', sanskrit: 'Parsvottanasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['hamstrings', 'hips'] },
  { id: 'revolved_triangle', name: 'Revolved Triangle', sanskrit: 'Parivrtta Trikonasana', difficulty: 'intermediate', category: 'standing', muscleGroups: ['legs', 'spine', 'obliques'] },
  
  // Inversions & Arm Balances
  { id: 'downdog', name: 'Downward-Facing Dog', sanskrit: 'Adho Mukha Svanasana', difficulty: 'beginner', category: 'inversion', muscleGroups: ['arms', 'shoulders', 'hamstrings'] },
  { id: 'dolphin', name: 'Dolphin Pose', sanskrit: 'Ardha Pincha Mayurasana', difficulty: 'intermediate', category: 'inversion', muscleGroups: ['shoulders', 'core', 'arms'] },
  { id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', difficulty: 'advanced', category: 'inversion', muscleGroups: ['core', 'shoulders', 'arms'] },
  { id: 'forearm_stand', name: 'Forearm Stand', sanskrit: 'Pincha Mayurasana', difficulty: 'advanced', category: 'inversion', muscleGroups: ['shoulders', 'core', 'arms'] },
  { id: 'handstand', name: 'Handstand', sanskrit: 'Adho Mukha Vrksasana', difficulty: 'advanced', category: 'inversion', muscleGroups: ['arms', 'shoulders', 'core'] },
  { id: 'shoulder_stand', name: 'Shoulder Stand', sanskrit: 'Sarvangasana', difficulty: 'intermediate', category: 'inversion', muscleGroups: ['core', 'shoulders'] },
  { id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', difficulty: 'intermediate', category: 'arm_balance', muscleGroups: ['arms', 'core', 'wrists'] },
  { id: 'side_crow', name: 'Side Crow', sanskrit: 'Parsva Bakasana', difficulty: 'advanced', category: 'arm_balance', muscleGroups: ['arms', 'core', 'obliques'] },
  { id: 'eight_angle', name: 'Eight-Angle Pose', sanskrit: 'Astavakrasana', difficulty: 'advanced', category: 'arm_balance', muscleGroups: ['arms', 'core', 'hips'] },
  
  // Forward Folds & Seated
  { id: 'seated_forward_fold', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['hamstrings', 'back'] },
  { id: 'head_to_knee', name: 'Head-to-Knee Pose', sanskrit: 'Janu Sirsasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['hamstrings', 'hips'] },
  { id: 'wide_angle_forward_fold', name: 'Wide-Angle Forward Fold', sanskrit: 'Upavistha Konasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['hamstrings', 'inner thighs'] },
  { id: 'bound_angle', name: 'Bound Angle Pose', sanskrit: 'Baddha Konasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['hips', 'inner thighs'] },
  { id: 'lotus', name: 'Lotus Pose', sanskrit: 'Padmasana', difficulty: 'intermediate', category: 'seated', muscleGroups: ['hips', 'knees'] },
  { id: 'half_lotus', name: 'Half Lotus', sanskrit: 'Ardha Padmasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['hips'] },
  { id: 'hero', name: 'Hero Pose', sanskrit: 'Virasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['quads', 'knees'] },
  { id: 'cow_face', name: 'Cow Face Pose', sanskrit: 'Gomukhasana', difficulty: 'intermediate', category: 'seated', muscleGroups: ['hips', 'shoulders'] },
  { id: 'staff', name: 'Staff Pose', sanskrit: 'Dandasana', difficulty: 'beginner', category: 'seated', muscleGroups: ['core', 'back'] },
  { id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', difficulty: 'intermediate', category: 'seated', muscleGroups: ['core', 'hip_flexors'] },
  
  // Backbends
  { id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', difficulty: 'beginner', category: 'backbend', muscleGroups: ['back', 'core'] },
  { id: 'updog', name: 'Upward-Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', difficulty: 'beginner', category: 'backbend', muscleGroups: ['back', 'arms', 'chest'] },
  { id: 'locust', name: 'Locust Pose', sanskrit: 'Salabhasana', difficulty: 'beginner', category: 'backbend', muscleGroups: ['back', 'glutes'] },
  { id: 'bow', name: 'Bow Pose', sanskrit: 'Dhanurasana', difficulty: 'intermediate', category: 'backbend', muscleGroups: ['back', 'quads', 'shoulders'] },
  { id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandhasana', difficulty: 'beginner', category: 'backbend', muscleGroups: ['glutes', 'back', 'legs'] },
  { id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', difficulty: 'advanced', category: 'backbend', muscleGroups: ['back', 'arms', 'shoulders'] },
  { id: 'camel', name: 'Camel Pose', sanskrit: 'Ustrasana', difficulty: 'intermediate', category: 'backbend', muscleGroups: ['back', 'quads', 'hip_flexors'] },
  { id: 'fish', name: 'Fish Pose', sanskrit: 'Matsyasana', difficulty: 'beginner', category: 'backbend', muscleGroups: ['chest', 'neck', 'back'] },
  { id: 'king_pigeon', name: 'King Pigeon Pose', sanskrit: 'Kapotasana', difficulty: 'advanced', category: 'backbend', muscleGroups: ['back', 'hips', 'shoulders'] },
  
  // Twists
  { id: 'seated_twist', name: 'Seated Spinal Twist', sanskrit: 'Ardha Matsyendrasana', difficulty: 'beginner', category: 'twist', muscleGroups: ['spine', 'obliques'] },
  { id: 'revolved_chair', name: 'Revolved Chair Pose', sanskrit: 'Parivrtta Utkatasana', difficulty: 'intermediate', category: 'twist', muscleGroups: ['legs', 'obliques', 'spine'] },
  { id: 'supine_twist', name: 'Supine Spinal Twist', sanskrit: 'Supta Matsyendrasana', difficulty: 'beginner', category: 'twist', muscleGroups: ['spine', 'hips'] },
  { id: 'revolved_side_angle', name: 'Revolved Side Angle', sanskrit: 'Parivrtta Parsvakonasana', difficulty: 'intermediate', category: 'twist', muscleGroups: ['legs', 'obliques', 'spine'] },
  
  // Hip Openers
  { id: 'pigeon', name: 'Pigeon Pose', sanskrit: 'Eka Pada Rajakapotasana', difficulty: 'intermediate', category: 'hip_opener', muscleGroups: ['hips', 'glutes'] },
  { id: 'lizard', name: 'Lizard Pose', sanskrit: 'Utthan Pristhasana', difficulty: 'intermediate', category: 'hip_opener', muscleGroups: ['hips', 'hip_flexors'] },
  { id: 'frog', name: 'Frog Pose', sanskrit: 'Mandukasana', difficulty: 'intermediate', category: 'hip_opener', muscleGroups: ['inner thighs', 'hips'] },
  { id: 'garland', name: 'Garland Pose', sanskrit: 'Malasana', difficulty: 'beginner', category: 'hip_opener', muscleGroups: ['hips', 'ankles'] },
  { id: 'happy_baby', name: 'Happy Baby Pose', sanskrit: 'Ananda Balasana', difficulty: 'beginner', category: 'hip_opener', muscleGroups: ['hips', 'lower_back'] },
  { id: 'fire_log', name: 'Fire Log Pose', sanskrit: 'Agnistambhasana', difficulty: 'intermediate', category: 'hip_opener', muscleGroups: ['hips', 'glutes'] },
  
  // Core Poses
  { id: 'plank', name: 'Plank Pose', sanskrit: 'Phalakasana', difficulty: 'beginner', category: 'core', muscleGroups: ['core', 'arms', 'shoulders'] },
  { id: 'side_plank', name: 'Side Plank', sanskrit: 'Vasisthasana', difficulty: 'intermediate', category: 'core', muscleGroups: ['obliques', 'arms', 'shoulders'] },
  { id: 'forearm_plank', name: 'Forearm Plank', sanskrit: 'Makara Adho Mukha Svanasana', difficulty: 'beginner', category: 'core', muscleGroups: ['core', 'shoulders'] },
  { id: 'four_limbed_staff', name: 'Four-Limbed Staff Pose', sanskrit: 'Chaturanga Dandasana', difficulty: 'intermediate', category: 'core', muscleGroups: ['arms', 'core', 'chest'] },
  
  // Restorative & Resting
  { id: 'child', name: 'Child\'s Pose', sanskrit: 'Balasana', difficulty: 'beginner', category: 'restorative', muscleGroups: ['back', 'hips'] },
  { id: 'corpse', name: 'Corpse Pose', sanskrit: 'Savasana', difficulty: 'beginner', category: 'restorative', muscleGroups: [] },
  { id: 'legs_up_wall', name: 'Legs Up the Wall', sanskrit: 'Viparita Karani', difficulty: 'beginner', category: 'restorative', muscleGroups: ['legs', 'back'] },
  { id: 'supported_fish', name: 'Supported Fish Pose', sanskrit: 'Salamba Matsyasana', difficulty: 'beginner', category: 'restorative', muscleGroups: ['chest', 'shoulders'] },
  { id: 'reclined_bound_angle', name: 'Reclined Bound Angle', sanskrit: 'Supta Baddha Konasana', difficulty: 'beginner', category: 'restorative', muscleGroups: ['hips', 'inner thighs'] },
  
  // Kneeling Poses
  { id: 'cat_cow', name: 'Cat-Cow Stretch', sanskrit: 'Marjaryasana-Bitilasana', difficulty: 'beginner', category: 'kneeling', muscleGroups: ['spine', 'core'] },
  { id: 'gate', name: 'Gate Pose', sanskrit: 'Parighasana', difficulty: 'beginner', category: 'kneeling', muscleGroups: ['obliques', 'hips'] },
  { id: 'extended_puppy', name: 'Extended Puppy Pose', sanskrit: 'Uttana Shishosana', difficulty: 'beginner', category: 'kneeling', muscleGroups: ['shoulders', 'spine'] },
  { id: 'low_lunge', name: 'Low Lunge', sanskrit: 'Anjaneyasana', difficulty: 'beginner', category: 'kneeling', muscleGroups: ['hip_flexors', 'quads'] },
  { id: 'crescent_lunge', name: 'Crescent Lunge', sanskrit: 'Alanasana', difficulty: 'beginner', category: 'standing', muscleGroups: ['hip_flexors', 'legs'] }
];

// Pre-defined yoga sequences
export const YOGA_SEQUENCES = [
  {
    id: 'sun_salutation_a',
    name: 'Sun Salutation A',
    sanskrit: 'Surya Namaskar A',
    difficulty: 'beginner',
    duration: 10,
    poses: ['mountain', 'standing_forward_fold', 'plank', 'four_limbed_staff', 'updog', 'downdog', 'standing_forward_fold', 'mountain'],
    description: 'Classic morning warm-up sequence to energize the body'
  },
  {
    id: 'sun_salutation_b',
    name: 'Sun Salutation B',
    sanskrit: 'Surya Namaskar B',
    difficulty: 'intermediate',
    duration: 15,
    poses: ['chair', 'standing_forward_fold', 'plank', 'four_limbed_staff', 'updog', 'downdog', 'warrior1', 'four_limbed_staff', 'updog', 'downdog', 'warrior1', 'standing_forward_fold', 'chair', 'mountain'],
    description: 'More challenging sun salutation with warrior poses'
  },
  {
    id: 'hip_opener_flow',
    name: 'Hip Opener Flow',
    sanskrit: '',
    difficulty: 'intermediate',
    duration: 20,
    poses: ['child', 'cat_cow', 'downdog', 'low_lunge', 'lizard', 'pigeon', 'half_lotus', 'bound_angle', 'happy_baby', 'corpse'],
    description: 'Deep hip opening sequence for flexibility'
  },
  {
    id: 'morning_energizer',
    name: 'Morning Energizer',
    sanskrit: '',
    difficulty: 'beginner',
    duration: 15,
    poses: ['child', 'cat_cow', 'downdog', 'plank', 'cobra', 'downdog', 'warrior1', 'warrior2', 'triangle', 'mountain'],
    description: 'Wake up and energize your body'
  },
  {
    id: 'stress_relief',
    name: 'Stress Relief Sequence',
    sanskrit: '',
    difficulty: 'beginner',
    duration: 25,
    poses: ['child', 'cat_cow', 'extended_puppy', 'pigeon', 'seated_forward_fold', 'supine_twist', 'happy_baby', 'legs_up_wall', 'corpse'],
    description: 'Calming sequence to release tension and stress'
  },
  {
    id: 'core_strength',
    name: 'Core Strength Flow',
    sanskrit: '',
    difficulty: 'intermediate',
    duration: 20,
    poses: ['plank', 'forearm_plank', 'side_plank', 'boat', 'plank', 'four_limbed_staff', 'updog', 'downdog', 'boat', 'corpse'],
    description: 'Build core strength and stability'
  },
  {
    id: 'backbend_flow',
    name: 'Backbend Flow',
    sanskrit: '',
    difficulty: 'intermediate',
    duration: 25,
    poses: ['child', 'cat_cow', 'cobra', 'locust', 'bow', 'camel', 'bridge', 'wheel', 'supine_twist', 'corpse'],
    description: 'Open the chest and strengthen the back'
  },
  {
    id: 'balance_practice',
    name: 'Balance Practice',
    sanskrit: '',
    difficulty: 'intermediate',
    duration: 20,
    poses: ['mountain', 'tree', 'eagle', 'warrior3', 'half_moon', 'standing_forward_fold', 'mountain', 'corpse'],
    description: 'Improve balance and concentration'
  },
  {
    id: 'restorative_evening',
    name: 'Restorative Evening',
    sanskrit: '',
    difficulty: 'beginner',
    duration: 30,
    poses: ['child', 'reclined_bound_angle', 'supported_fish', 'legs_up_wall', 'supine_twist', 'happy_baby', 'corpse'],
    description: 'Wind down before bed with gentle poses'
  },
  {
    id: 'power_yoga',
    name: 'Power Yoga Flow',
    sanskrit: '',
    difficulty: 'advanced',
    duration: 45,
    poses: ['mountain', 'chair', 'standing_forward_fold', 'plank', 'four_limbed_staff', 'updog', 'downdog', 'warrior1', 'warrior2', 'warrior3', 'half_moon', 'triangle', 'crow', 'headstand', 'wheel', 'corpse'],
    description: 'Challenging flow for experienced practitioners'
  }
];

// Breathwork/Pranayama types
export const BREATHWORK_TYPES = [
  { id: 'ujjayi', name: 'Ujjayi Breathing', description: 'Ocean breath - calming and heating', difficulty: 'beginner' },
  { id: 'nadi_shodhana', name: 'Nadi Shodhana', description: 'Alternate nostril breathing - balancing', difficulty: 'beginner' },
  { id: 'kapalabhati', name: 'Kapalabhati', description: 'Skull shining breath - energizing', difficulty: 'intermediate' },
  { id: 'bhastrika', name: 'Bhastrika', description: 'Bellows breath - energizing', difficulty: 'intermediate' },
  { id: 'sitali', name: 'Sitali', description: 'Cooling breath - calming', difficulty: 'beginner' },
  { id: 'lions_breath', name: 'Lion\'s Breath', description: 'Simhasana - stress releasing', difficulty: 'beginner' },
  { id: 'box_breathing', name: 'Box Breathing', description: 'Equal ratio breathing - calming', difficulty: 'beginner' },
  { id: 'breath_of_fire', name: 'Breath of Fire', description: 'Rapid diaphragmatic breathing - energizing', difficulty: 'advanced' }
];

// Yoga props
export const YOGA_PROPS = [
  { id: 'mat', name: 'Yoga Mat', icon: '🧘' },
  { id: 'block', name: 'Yoga Block', icon: '🧱' },
  { id: 'strap', name: 'Yoga Strap', icon: '🎗️' },
  { id: 'bolster', name: 'Bolster', icon: '🛏️' },
  { id: 'blanket', name: 'Blanket', icon: '🧣' },
  { id: 'wheel', name: 'Yoga Wheel', icon: '⭕' },
  { id: 'cushion', name: 'Meditation Cushion', icon: '🛋️' }
];

// Yoga styles
export const YOGA_STYLES = [
  { id: 'vinyasa', name: 'Vinyasa', description: 'Flow yoga - movement synchronized with breath' },
  { id: 'hatha', name: 'Hatha', description: 'Traditional - focus on postures and breathing' },
  { id: 'ashtanga', name: 'Ashtanga', description: 'Athletic - fixed sequence of poses' },
  { id: 'yin', name: 'Yin', description: 'Slow-paced - poses held for longer periods' },
  { id: 'restorative', name: 'Restorative', description: 'Relaxing - supported poses for deep rest' },
  { id: 'power', name: 'Power Yoga', description: 'Fitness-based - strength and flexibility' },
  { id: 'kundalini', name: 'Kundalini', description: 'Spiritual - breathwork, movement, meditation' },
  { id: 'bikram', name: 'Bikram/Hot Yoga', description: '26 poses in heated room' },
  { id: 'iyengar', name: 'Iyengar', description: 'Precise alignment - uses props extensively' },
  { id: 'prenatal', name: 'Prenatal', description: 'Modified practice for pregnancy' },
  { id: 'other', name: 'Other', description: 'Other yoga style' }
];

export default {
  YOGA_POSES,
  YOGA_SEQUENCES,
  BREATHWORK_TYPES,
  YOGA_PROPS,
  YOGA_STYLES
};
