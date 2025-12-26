import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Brain, 
  BarChart3, 
  Zap, 
  Target, 
  TrendingUp,
  ChevronRight,
  Play
} from 'lucide-react';
import { Button, AnimatedCounter } from '../components/ui';

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  
  return (
    <div className="min-h-screen bg-dark-500 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-dark-500" />
            </div>
            <span className="text-xl font-bold gradient-text">SportTrack AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#stats" className="text-gray-300 hover:text-white transition-colors">Stats</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Athletes</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-glow-primary opacity-30" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lime-500/20 rounded-full blur-[100px]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-sm text-gray-300">AI-Powered Performance Analytics</span>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Train Smarter.</span>
            <br />
            <span className="gradient-text">Perform Better.</span>
            <br />
            <span className="text-gray-400 text-4xl md:text-5xl lg:text-6xl">Powered by AI.</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The ultimate platform for athletes. Log workouts, analyze performance trends, 
            and receive AI-powered insights to optimize your training.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" icon={Zap}>
                Start Free Trial
              </Button>
            </Link>
            <Button variant="secondary" size="lg" icon={Play}>
              Watch Demo
            </Button>
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Dashboard Preview */}
              <div className="glass rounded-2xl p-4 shadow-2xl">
                <div className="bg-dark-300 rounded-xl overflow-hidden">
                  {/* Mock Dashboard Header */}
                  <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-crimson-500" />
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <div className="w-3 h-3 rounded-full bg-lime-500" />
                    </div>
                    <div className="text-sm text-gray-500">Dashboard Preview</div>
                  </div>
                  
                  {/* Mock Dashboard Content */}
                  <div className="p-6 grid grid-cols-3 gap-4">
                    {/* Score Card */}
                    <div className="col-span-1 bg-dark-400/50 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-2">Performance Score</div>
                      <div className="text-4xl font-bold text-primary-500">87</div>
                      <div className="text-sm text-lime-500 mt-1">+5 this week</div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-dark-400/50 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Weekly Distance</div>
                        <div className="text-2xl font-bold text-white">42.5 km</div>
                      </div>
                      <div className="bg-dark-400/50 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Training Hours</div>
                        <div className="text-2xl font-bold text-white">8.5 hrs</div>
                      </div>
                    </div>
                    
                    {/* Chart Mock */}
                    <div className="col-span-3 bg-dark-400/50 rounded-xl p-4 h-32">
                      <div className="flex items-end justify-between h-full gap-2">
                        {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                            className="flex-1 rounded-t-lg bg-gradient-to-t from-primary-500/50 to-primary-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -right-8 glass rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-lime-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Trending Up</div>
                    <div className="text-lg font-bold text-white">+12%</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 glass rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">AI Insight</div>
                    <div className="text-sm font-medium text-white">Ready for intervals</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary-500"
            />
          </div>
        </motion.div>
      </motion.section>
      
      {/* Stats Section */}
      <section id="stats" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 50000, label: 'Active Athletes', suffix: '+' },
              { value: 2.5, label: 'Million Workouts', suffix: 'M' },
              { value: 98, label: 'Satisfaction Rate', suffix: '%' },
              { value: 15, label: 'Performance Gain', suffix: '%', prefix: '+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.value < 10 ? 1 : 0}
                  />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to track, analyze, and optimize your athletic performance.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                title: 'Smart Workout Logging',
                description: 'Log runs, lifts, cardio, and biometrics with our intuitive forms. Import GPX and CSV files.',
                color: 'primary'
              },
              {
                icon: Brain,
                title: 'AI-Powered Insights',
                description: 'Get personalized training recommendations based on your performance data and trends.',
                color: 'lime'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Visualize your progress with interactive charts and training load heatmaps.',
                color: 'orange'
              },
              {
                icon: Target,
                title: 'Goal Tracking',
                description: 'Set and track your fitness goals with progress indicators and milestones.',
                color: 'crimson'
              },
              {
                icon: TrendingUp,
                title: 'Performance Scoring',
                description: 'Real-time performance score based on consistency, intensity, and recovery.',
                color: 'primary'
              },
              {
                icon: Zap,
                title: 'Weekly Training Plans',
                description: 'Export AI-generated weekly training plans as beautiful PDF documents.',
                color: 'lime'
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-hover group"
              >
                <div className={`
                  w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                  ${feature.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                  ${feature.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                  ${feature.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                  ${feature.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
                  group-hover:scale-110 transition-transform
                `}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-glow-lime opacity-20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to <span className="gradient-text">Transform</span> Your Training?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of athletes who are already training smarter with AI-powered insights.
            </p>
            <Link to="/register">
              <Button size="xl" icon={ChevronRight} iconPosition="right">
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-dark-500" />
              </div>
              <span className="font-bold text-white">SportTrack AI</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Sports Performance Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
