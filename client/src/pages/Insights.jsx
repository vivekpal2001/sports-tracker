import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target
} from 'lucide-react';
import { Card, CircularProgress, TypeWriter, LoadingSpinner, Button } from '../components/ui';
import { aiAPI } from '../services/api';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    fetchInsights();
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  const fetchInsights = async () => {
    try {
      const [insightsRes, historyRes] = await Promise.all([
        aiAPI.analyze(),
        aiAPI.getChatHistory()
      ]);
      
      setInsights(insightsRes.data.data);
      
      // Load chat history or set initial message
      if (historyRes.data.data && historyRes.data.data.length > 0) {
        setChatMessages(historyRes.data.data);
      } else {
        // No history - add initial AI message
        setChatMessages([{
          role: 'assistant',
          content: insightsRes.data.data?.summary || "Hello! I'm your AI coach. Ask me anything about your training!",
          suggestions: [
            "How is my training going?",
            "What should I work on?",
            "Am I recovering well?"
          ]
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const response = await aiAPI.chat(message);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.data.response,
        suggestions: response.data.data.suggestions
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again!",
        suggestions: []
      }]);
    } finally {
      setChatLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Analyzing your performance..." />
      </div>
    );
  }
  
  const score = insights?.performanceScore ?? 0;
  const scoreBreakdown = insights?.scoreBreakdown || {};
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">AI Insights</h1>
        <p className="text-gray-400">Personalized analysis powered by AI</p>
      </div>
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Performance Score */}
        <Card glow className="lg:col-span-1 flex flex-col items-center py-8">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Performance Score</h3>
          <CircularProgress value={score} size={140} strokeWidth={10} />
          <p className="text-sm text-gray-400 mt-4">
            {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good progress' : 'Room to improve'}
          </p>
        </Card>
        
        {/* Score Breakdown */}
        <Card className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-white mb-6">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Consistency', value: scoreBreakdown.consistency ?? 0, color: 'primary' },
              { label: 'Intensity', value: scoreBreakdown.intensity ?? 0, color: 'lime' },
              { label: 'Recovery', value: scoreBreakdown.recovery ?? 0, color: 'orange' },
              { label: 'Progression', value: scoreBreakdown.progression ?? 0, color: 'crimson' }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <CircularProgress 
                  value={item.value} 
                  size={80} 
                  strokeWidth={6}
                  showValue={true}
                />
                <p className="text-sm text-gray-400 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Key Insights & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Key Insights</h3>
          </div>
          <div className="space-y-3">
            {insights?.keyInsights?.length > 0 ? (
              insights.keyInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-dark-300/50"
                >
                  <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{insight}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Log some workouts to get AI insights</p>
            )}
          </div>
        </Card>
        
        {/* Trends */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-lime-500" />
            <h3 className="text-lg font-semibold text-white">Trends</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-lime-500 mb-2">Positive Trends</h4>
              <div className="space-y-2">
                {insights?.trends?.positive?.length > 0 ? (
                  insights.trends.positive.map((trend, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-lime-500" />
                      {trend}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No trends available yet</p>
                )}
              </div>
            </div>
            
            {insights?.trends?.negative?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-500 mb-2">Areas to Watch</h4>
                <div className="space-y-2">
                  {insights.trends.negative.map((trend, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
        </div>
        {insights?.recommendations?.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {insights.recommendations.slice(0, 3).map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`
                  p-4 rounded-xl border
                  ${rec.priority === 'high' ? 'bg-crimson-500/10 border-crimson-500/30' : ''}
                  ${rec.priority === 'medium' ? 'bg-orange-500/10 border-orange-500/30' : ''}
                  ${rec.priority === 'low' ? 'bg-lime-500/10 border-lime-500/30' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-xs font-bold uppercase
                    ${rec.priority === 'high' ? 'text-crimson-500' : ''}
                    ${rec.priority === 'medium' ? 'text-orange-500' : ''}
                    ${rec.priority === 'low' ? 'text-lime-500' : ''}
                  `}>
                    {rec.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">{rec.category}</span>
                </div>
                <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-400">{rec.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Log workouts to receive personalized recommendations</p>
        )}
      </Card>
      
      {/* AI Chat */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-dark-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Coach</h3>
              <p className="text-xs text-gray-400">Ask me anything about your training</p>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto mb-4 space-y-4 pr-2 hide-scrollbar">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] p-4 rounded-2xl
                  ${msg.role === 'user' 
                    ? 'bg-primary-500 text-dark-500' 
                    : 'bg-dark-300/50 text-gray-200'}
                `}>
                  <p>{msg.content}</p>
                  
                  {/* Suggestions */}
                  {msg.role === 'assistant' && msg.suggestions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(suggestion)}
                          className="px-3 py-1 rounded-full bg-dark-200/50 text-xs text-gray-300 hover:bg-dark-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-300/50 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary-500"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(chatInput)}
              placeholder="Ask about your training..."
              className="flex-1 px-4 py-3 rounded-xl bg-dark-300/50 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500"
            />
            <Button
              onClick={() => sendMessage(chatInput)}
              disabled={!chatInput.trim() || chatLoading}
              icon={Send}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
