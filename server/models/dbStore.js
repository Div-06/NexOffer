const mongoose = require('mongoose');

// In-Memory store arrays for zero-downtime offline fallback
const memoryStore = {
  users: [],
  profiles: [],
  bookmarks: [],
  histories: [],
};

const isMongooseConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Generate ObjectId-like hex string
const generateId = () => {
  return (
    Math.floor(Date.now() / 1000).toString(16) +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
      .toLowerCase()
  );
};

// --- USER REPOSITORY ---
const UserModel = require('./User');

const UserRepository = {
  async findOne(query) {
    if (isMongooseConnected()) {
      return UserModel.findOne(query);
    }
    const match = memoryStore.users.find((u) => {
      if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
      if (query._id && u._id.toString() === query._id.toString()) return true;
      return false;
    });
    if (!match) return null;
    return {
      ...match,
      async save() {
        const idx = memoryStore.users.findIndex((x) => x._id === match._id);
        if (idx !== -1) memoryStore.users[idx] = this;
        return this;
      },
    };
  },

  async findById(id) {
    if (isMongooseConnected()) {
      return UserModel.findById(id).select('-passwordHash');
    }
    const match = memoryStore.users.find((u) => u._id.toString() === id.toString());
    if (!match) return null;
    const { passwordHash, ...rest } = match;
    return {
      ...rest,
      async save() {
        const idx = memoryStore.users.findIndex((x) => x._id === match._id);
        if (idx !== -1) memoryStore.users[idx] = { ...memoryStore.users[idx], ...this };
        return this;
      },
    };
  },

  async create(data) {
    if (isMongooseConnected()) {
      return UserModel.create(data);
    }
    const doc = {
      _id: generateId(),
      ...data,
      isVerified: data.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      async save() {
        const idx = memoryStore.users.findIndex((x) => x._id === doc._id);
        if (idx !== -1) memoryStore.users[idx] = this;
        return this;
      },
    };
    memoryStore.users.push(doc);
    return doc;
  },
};

// --- PROFILE REPOSITORY ---
const ProfileModel = require('./Profile');

const ProfileRepository = {
  async findOne(query) {
    if (isMongooseConnected()) {
      return ProfileModel.findOne(query);
    }
    const match = memoryStore.profiles.find((p) => {
      if (query.userId && p.userId.toString() === query.userId.toString()) return true;
      return false;
    });
    if (!match) return null;
    return {
      ...match,
      async save() {
        const idx = memoryStore.profiles.findIndex((x) => x._id === match._id);
        if (idx !== -1) memoryStore.profiles[idx] = this;
        return this;
      },
    };
  },

  async create(data) {
    if (isMongooseConnected()) {
      return ProfileModel.create(data);
    }
    const doc = {
      _id: generateId(),
      company: '',
      role: '',
      jobDescription: '',
      resumeText: '',
      skills: [],
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      async save() {
        const idx = memoryStore.profiles.findIndex((x) => x._id === doc._id);
        if (idx !== -1) memoryStore.profiles[idx] = this;
        return this;
      },
    };
    memoryStore.profiles.push(doc);
    return doc;
  },
};

// --- BOOKMARK REPOSITORY ---
const BookmarkModel = require('./Bookmark');

const BookmarkRepository = {
  async find(query = {}) {
    if (isMongooseConnected()) {
      const q = BookmarkModel.find(query);
      return q;
    }
    let list = memoryStore.bookmarks.filter((b) => {
      if (query.userId && b.userId.toString() !== query.userId.toString()) return false;
      if (query.category && b.category !== query.category) return false;
      if (query.question && query.question.$regex) {
        const regex = new RegExp(query.question.$regex, query.question.$options || 'i');
        return regex.test(b.question);
      }
      return true;
    });
    return {
      sort: () => list.slice().reverse(),
    };
  },

  async findOne(query) {
    if (isMongooseConnected()) {
      return BookmarkModel.findOne(query);
    }
    const match = memoryStore.bookmarks.find((b) => {
      if (query.userId && b.userId.toString() !== query.userId.toString()) return false;
      if (query.question && b.question === query.question) return true;
      if (query._id && b._id.toString() === query._id.toString()) return true;
      return false;
    });
    if (!match) return null;
    return {
      ...match,
      async save() {
        const idx = memoryStore.bookmarks.findIndex((x) => x._id === match._id);
        if (idx !== -1) memoryStore.bookmarks[idx] = this;
        return this;
      },
    };
  },

  async create(data) {
    if (isMongooseConnected()) {
      return BookmarkModel.create(data);
    }
    const doc = {
      _id: generateId(),
      category: 'General',
      difficulty: 'Medium',
      topic: '',
      suggestedAnswer: '',
      notes: '',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      async save() {
        const idx = memoryStore.bookmarks.findIndex((x) => x._id === doc._id);
        if (idx !== -1) memoryStore.bookmarks[idx] = this;
        return this;
      },
    };
    memoryStore.bookmarks.push(doc);
    return doc;
  },

  async findOneAndDelete(query) {
    if (isMongooseConnected()) {
      return BookmarkModel.findOneAndDelete(query);
    }
    const idx = memoryStore.bookmarks.findIndex((b) => {
      if (query._id && b._id.toString() === query._id.toString()) return true;
      return false;
    });
    if (idx === -1) return null;
    const removed = memoryStore.bookmarks.splice(idx, 1)[0];
    return removed;
  },
};

// --- HISTORY REPOSITORY ---
const HistoryModel = require('./History');

const HistoryRepository = {
  async find(query = {}) {
    if (isMongooseConnected()) {
      return HistoryModel.find(query);
    }
    let list = memoryStore.histories.filter((h) => {
      if (query.userId && h.userId.toString() !== query.userId.toString()) return false;
      return true;
    });
    return {
      sort: () => ({
        limit: (n) => list.slice().reverse().slice(0, n),
      }),
    };
  },

  async create(data) {
    if (isMongooseConnected()) {
      return HistoryModel.create(data);
    }
    const doc = {
      _id: generateId(),
      summary: '',
      company: '',
      role: '',
      metadata: {},
      ...data,
      createdAt: new Date(),
    };
    memoryStore.histories.push(doc);
    return doc;
  },

  async findOneAndDelete(query) {
    if (isMongooseConnected()) {
      return HistoryModel.findOneAndDelete(query);
    }
    const idx = memoryStore.histories.findIndex((h) => h._id.toString() === query._id.toString());
    if (idx === -1) return null;
    return memoryStore.histories.splice(idx, 1)[0];
  },

  async deleteMany(query) {
    if (isMongooseConnected()) {
      return HistoryModel.deleteMany(query);
    }
    memoryStore.histories = memoryStore.histories.filter(
      (h) => h.userId.toString() !== query.userId.toString()
    );
    return { acknowledged: true };
  },
};

module.exports = {
  UserRepository,
  ProfileRepository,
  BookmarkRepository,
  HistoryRepository,
};
