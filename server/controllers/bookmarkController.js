const { BookmarkRepository } = require('../models/dbStore');

// @desc    Get all bookmarked questions for current user
// @route   GET /api/bookmarks
const getBookmarks = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }

    const cursor = await BookmarkRepository.find(query);
    const bookmarks = cursor.sort ? await cursor.sort({ createdAt: -1 }) : cursor;

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a question to bookmarks
// @route   POST /api/bookmarks
const createBookmark = async (req, res, next) => {
  try {
    const { question, category = 'General', difficulty = 'Medium', topic = '', suggestedAnswer = '', notes = '' } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question content is required.',
      });
    }

    const existing = await BookmarkRepository.findOne({
      userId: req.user._id,
      question: question.trim(),
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Question is already in your bookmarks.',
        bookmark: existing,
      });
    }

    const bookmark = await BookmarkRepository.create({
      userId: req.user._id,
      question: question.trim(),
      category,
      difficulty,
      topic,
      suggestedAnswer,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Question saved to bookmarks!',
      bookmark,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a bookmark (notes)
// @route   PUT /api/bookmarks/:id
const updateBookmark = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const bookmark = await BookmarkRepository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found.',
      });
    }

    if (notes !== undefined) bookmark.notes = notes;
    await bookmark.save();

    res.status(200).json({
      success: true,
      message: 'Bookmark updated successfully!',
      bookmark,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await BookmarkRepository.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};
