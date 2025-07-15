const { Schema } = require('mongoose');

const updateTicketSchema = new Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved', 'closed', 'escalated']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'sales', 'general', 'support']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.dueDate || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  resolution: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  _id: false // This schema is for validation only, not for creating documents
});

module.exports = updateTicketSchema;