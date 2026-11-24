import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
const allowedCategories = ['Technology', 'Cultural', 'Workshop', 'Sports', 'Other'];

function validateEvent(body) {
  const { name, date, time, venue, category, description = '' } = body || {};
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return 'Event name is required (maximum 100 characters)';
  if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) return 'A valid event date is required';
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return 'A valid event time is required';
  if (typeof venue !== 'string' || !venue.trim() || venue.length > 120) return 'Venue is required (maximum 120 characters)';
  if (!allowedCategories.includes(category)) return 'Choose a valid event category';
  if (typeof description !== 'string' || description.length > 500) return 'Description must be 500 characters or fewer';
  return null;
}

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ date: 1 });
    res.json({ events });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const problem = validateEvent(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const { name, date, time, venue, category, description = '' } = req.body;
    const event = await Event.create({
      name: name.trim(), date, time, venue: venue.trim(), category,
      description: description.trim(), createdBy: req.user.id
    });
    res.status(201).json({ event });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const problem = validateEvent(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const { name, date, time, venue, category, description = '' } = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { name: name.trim(), date, time, venue: venue.trim(), category, description: description.trim() },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) { next(error); }
});

export default router;
