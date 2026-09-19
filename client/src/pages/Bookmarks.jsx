import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Trash2,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import api from '../services/api';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMap, setExpandedMap] = useState({});
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'All',
    'Technical',
    'HR',
    'Behavioural',
    'Role-Specific',
    'Company-Specific',
    'Resume-Based',
  ];

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      if (res.data?.bookmarks) {
        setBookmarks(res.data.bookmarks);
      }
    } catch (err) {
      setError('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this question from bookmarks?')) return;
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await api.put(`/bookmarks/${id}`, { notes: noteText });
      setBookmarks((prev) =>
        prev.map((b) => (b._id === id ? { ...b, notes: noteText } : b))
      );
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesCat =
      selectedCategory === 'All' ||
      b.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      b.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Library</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bookmarked Questions ({bookmarks.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your saved interview questions, custom study notes, and frameworks
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by question, topic, or personal notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Loading saved bookmarks...</p>
        </div>
      )}

      {!loading && filteredBookmarks.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Bookmarks Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            You haven't bookmarked any questions in this category yet. Click the Bookmark button in
            Interview Prep or Resume Questions to save them here!
          </p>
        </div>
      )}

      {/* Bookmarks List */}
      {!loading && filteredBookmarks.length > 0 && (
        <div className="space-y-4">
          {filteredBookmarks.map((b, idx) => {
            const isExp = expandedMap[b._id];
            const isEditingNotes = editingNotesId === b._id;

            return (
              <div
                key={b._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-md">
                      {b.category}
                    </span>
                    {b.topic && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {b.topic}
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                      {b.difficulty || 'Medium'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isEditingNotes) {
                          setEditingNotesId(null);
                        } else {
                          setEditingNotesId(b._id);
                          setNoteText(b.notes || '');
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{b.notes ? 'Edit Notes' : 'Add Note'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {idx + 1}. {b.question}
                </h4>

                {/* Suggested Answer Toggle */}
                {b.suggestedAnswer && (
                  <div>
                    <button
                      onClick={() => setExpandedMap({ ...expandedMap, [b._id]: !isExp })}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 focus:outline-none"
                    >
                      <span>{isExp ? 'Hide Answer Framework' : 'View Answer Framework'}</span>
                      {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExp && (
                      <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {b.suggestedAnswer}
                      </div>
                    )}
                  </div>
                )}

                {/* Inline Notes Box */}
                {isEditingNotes ? (
                  <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                      My Personal Preparation Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add your talking points, past project metrics, or memory triggers here..."
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(b._id)}
                        className="px-3 py-1 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  b.notes && (
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <span className="font-bold text-amber-700 flex-shrink-0">My Note:</span>
                      <p>{b.notes}</p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
