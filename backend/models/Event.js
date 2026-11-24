import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: Date, required: true },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  venue: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, enum: ['Technology', 'Cultural', 'Workshop', 'Sports', 'Other'] },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
