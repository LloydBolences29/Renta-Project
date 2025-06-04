const Visit = require('../modelSchema/visitModelSchema')

// POST /api/visitor-log
const createVisitorLog = async (req, res) => {
  try {
    const { name, email, page } = req.body;
    const log = await Visit.create({ name, email, page });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating visitor log' });
  }
};

// GET /api/visitor-log
const getVisitorLogs = async (req, res) => {
  try {
    const logs = await Visit.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching visitor logs' });
  }
};


module.exports = {
    getVisitorLogs,
    createVisitorLog
}
