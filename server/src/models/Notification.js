import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['reaction', 'comment', 'follow', 'badge', 'mention', 'challenge_join', 'challenge_invite'],
    required: true
  },
  // What the notification is about
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  // Additional context
  message: String,
  reactionType: String, // For reaction notifications
  // Status
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
