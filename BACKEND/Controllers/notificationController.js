const Notification = require('../modelSchema/notificationSchema');

// Get all notifications for a user
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error creating notification' });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating notification' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting notification' });
  }
};

module.exports = {
  getNotificationsByUser,
  createNotification,
  markNotificationAsRead,
  deleteNotification
};
