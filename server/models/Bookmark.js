const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: ['Technical', 'HR', 'Behavioural', 'Role-Specific', 'Company-Specific', 'Resume-Based', 'General'],
    },
    difficulty: {
      type: String,
      default: 'Medium',
      enum: ['Easy', 'Medium', 'Hard'],
    },
    topic: {
      type: String,
      default: '',
    },
    suggestedAnswer: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bookmark', bookmarkSchema);
