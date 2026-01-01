import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  suggestions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ user: 1, createdAt: -1 });

// Static method to get chat history for a user
chatMessageSchema.statics.getChatHistory = async function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
};

// Static method to clear chat history for a user
chatMessageSchema.statics.clearHistory = async function(userId) {
  return this.deleteMany({ user: userId });
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
