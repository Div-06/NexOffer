import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Trash2,
  HelpCircle,
  Code2,
  FileText,
  Building2,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const CareerAssistant = () => {
  const { profile } = useProfile();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your **NexOffer AI Career Assistant** 🎯\n\nI have loaded your target context for **${
        profile?.role || 'Software Engineer'
      }** at **${
        profile?.company || 'Target Company'
      }**.\n\nAsk me anything! I can:\n- Run a live 1-on-1 mock interview with you\n- Explain how to pitch projects on your resume\n- Break down difficult JD requirements or system design questions\n- Review your answers and give instant actionable feedback!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    'Mock interview me on React & State Management',
    'How should I explain my hardest project challenge?',
    'What are the most likely system design questions for this role?',
    'Evaluate my 90-second "Tell me about yourself" elevator pitch',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.post('/chat', {
        message: text.trim(),
        conversationHistory: historyPayload,
      });

      if (res.data?.reply) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.reply,
          provider: res.data.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '⚠️ Sorry, I encountered an issue generating a response. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'assistant',
          text: `Conversation cleared. What would you like to prepare next for **${
            profile?.role || 'your role'
          }** at **${profile?.company || 'your target company'}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Helper to format basic markdown-style text safely (bolding, lists, code)
  const formatBotText = (text) => {
    // Simple line-by-line formatting for clean readability
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-brand-700 px-1 py-0.5 rounded text-xs">$1</code>');

      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-sm text-slate-900 mt-2 mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace('### ', '') }} />;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, '') }} />
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-slate-700 my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s+/, '') }} />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                AI Career Assistant
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-500 block">
              Context: {profile?.role || 'Engineer'} @ {profile?.company || 'Target Company'}
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-card ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/80 rounded-tl-none space-y-1'
                }`}
              >
                {isUser ? (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1">{formatBotText(msg.text)}</div>
                )}

                <div
                  className={`flex items-center justify-between gap-3 text-[10px] mt-1 pt-1 ${
                    isUser ? 'text-brand-200' : 'text-slate-400 border-t border-slate-200/40'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.provider && (
                    <span className="font-semibold text-slate-400">{msg.provider}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Analyzing context and preparing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Try:
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-brand-400 hover:text-brand-600 transition-colors whitespace-nowrap shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${profile?.company || 'interviews'}, projects, code doubts, or role questions...`}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 placeholder-slate-400"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CareerAssistant;
