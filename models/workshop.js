const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: String,
  description: String,
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
}, { timestamps: true });

module.exports = mongoose.model('Workshop', workshopSchema);
