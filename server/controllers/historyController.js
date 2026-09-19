const { HistoryRepository } = require('../models/dbStore');

// @desc    Get user preparation history
// @route   GET /api/history
const getHistory = async (req, res, next) => {
  try {
    const cursor = await HistoryRepository.find({ userId: req.user._id });
    const sorted = cursor.sort ? cursor.sort({ createdAt: -1 }) : cursor;
    const history = sorted.limit ? await sorted.limit(50) : sorted;

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single history entry
// @route   DELETE /api/history/:id
const deleteHistoryItem = async (req, res, next) => {
  try {
    const item = await HistoryRepository.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'History item not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'History item removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all user history
// @route   DELETE /api/history
const clearHistory = async (req, res, next) => {
  try {
    await HistoryRepository.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'All preparation history cleared.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  deleteHistoryItem,
  clearHistory,
};
