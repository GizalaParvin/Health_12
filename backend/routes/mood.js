const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MoodLog = require('../models/MoodLog');

// Suggestion logic based on mood
const getSuggestion = (mood) => {
  switch (mood) {
    case 'Angry': return 'Intense activity: Try a 10-minute sprint or punching a pillow.';
    case 'Stress':
    case 'Stressed': return 'Yoga/Stretching: Try a 5-minute deep breathing or stretching routine.';
    case 'Grief':
    case 'Sad': return 'Gentle movement: Try a short walk outside or listening to calming music.';
    case 'Anxiety': return 'Grounding: Try the 5-4-3-2-1 sensory grounding technique.';
    case 'Happy': return 'Share the joy: Call a friend or write down what made you happy today.';
    default: return 'Take a moments breath and drink some water.';
  }
};

// @route   POST api/mood
// @desc    Log a new mood
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { mood, intensity, notes } = req.body;
    const recommendedActivity = getSuggestion(mood);

    const newMoodLog = new MoodLog({
      user: req.user.id,
      mood,
      intensity,
      notes,
      recommendedActivity
    });

    const moodLog = await newMoodLog.save();
    res.json({ moodLog, suggestion: recommendedActivity });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/mood
// @desc    Get all mood logs for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const moodLogs = await MoodLog.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(moodLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/mood/trends
// @desc    Get mood trends (simplified for Chart.js)
// @access  Private
router.get('/trends', auth, async (req, res) => {
  try {
    // Return last 7 days of logs
    const date = new Date();
    date.setDate(date.getDate() - 7);
    
    const logs = await MoodLog.find({ 
      user: req.user.id,
      createdAt: { $gte: date }
    }).sort({ createdAt: 1 });

    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
