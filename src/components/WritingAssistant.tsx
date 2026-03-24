import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Mail, 
  FileText, 
  StickyNote, 
  Bell, 
  Baby, 
  Flame, 
  Copy, 
  RefreshCw, 
  Download, 
  Check, 
  ChevronRight, 
  Send,
  User,
  Hash,
  Smile,
  Zap,
  Heart,
  Laugh,
  UserPlus,
  Clock,
  AlertCircle,
  Briefcase,
  Frown
} from 'lucide-react';
import { generateWritingAssistantContent } from '../services/geminiService';
import { WritingMode, TextingType, StudyType, WritingTone } from '../types';

interface WritingAssistantProps {
  user: any;
}

const TEXTING_TYPES: { id: TextingType; label: string; icon: any; color: string }[] = [
  { id: 'start', label: 'Start Conversation', icon: Send, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'continue', label: 'Continue Chat', icon: MessageSquare, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  { id: 'rizz', label: 'Flirty / Rizz', icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  { id: 'apology', label: 'Apology', icon: Heart, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'funny', label: 'Funny', icon: Laugh, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'friendly', label: 'Friendly', icon: Smile, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
  { id: 'professional', label: 'Professional', icon: Briefcase, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'emotional', label: 'Emotional', icon: Frown, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
];

const STUDY_TYPES: { id: StudyType; label: string; icon: any; color: string }[] = [
  { id: 'email', label: 'Email Writer', icon: Mail, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'letter', label: 'Letter Writer', icon: FileText, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'note', label: 'Note Writer', icon: StickyNote, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'notice', label: 'Notice Writer', icon: Bell, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
];

const SMART_BUTTONS: { id: WritingTone; label: string; icon: any }[] = [
  { id: 'funny', label: 'More Funny', icon: Laugh },
  { id: 'romantic', label: 'More Romantic', icon: Heart },
  { id: 'savage', label: 'More Savage', icon: Flame },
  { id: 'short', label: 'Make Shorter', icon: Zap },
  { id: 'long', label: 'Make Longer', icon: FileText },
];

const TEMPLATES = {
  texting: [
    { label: 'Text your crush 😏', input: 'I want to text my crush and say something smooth.', type: 'rizz' as TextingType },
    { label: 'Fix awkward message 😬', input: 'I sent an awkward message and need to fix the vibe.', type: 'apology' as TextingType },
    { label: 'Reply after long time ⏳', input: 'Replying to someone I haven\'t talked to in months.', type: 'friendly' as TextingType },
  ],
  study: [
    { label: 'Write leave letter', input: 'Need a leave letter for school due to fever.', type: 'letter' as StudyType },
    { label: 'Email to teacher', input: 'Asking teacher for extension on assignment.', type: 'email' as StudyType },
    { label: 'Create school notice', input: 'Notice for upcoming sports day event.', type: 'notice' as StudyType },
    { label: 'Make short note', input: 'Summary of photosynthesis for revision.', type: 'note' as StudyType },
  ]
};

export const WritingAssistant: React.FC<WritingAssistantProps> = ({ user }) => {
  const [mode, setMode] = useState<WritingMode>('texting');
  const [activeType, setActiveType] = useState<string>('rizz');
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [isKidFriendly, setIsKidFriendly] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (overrideTone?: string) => {
    if (!input.trim() && !context.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await generateWritingAssistantContent(mode, activeType, input, {
        tone: overrideTone,
        recipient,
        subject,
        isKidFriendly,
        context
      });
      setResults(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadText = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-writing-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800"
        >
          <Sparkles size={14} /> AI Writing Assistant 😏🔥📚
        </motion.div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
          Write Anything <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Better & Faster
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          From smooth rizz to formal school emails. The ultimate AI writing tool for your daily life.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex gap-1">
          <button
            onClick={() => { setMode('texting'); setActiveType('rizz'); setResults([]); }}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mode === 'texting' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <MessageSquare size={18} /> TEXTING MODE 😏
          </button>
          <button
            onClick={() => { setMode('study'); setActiveType('email'); setResults([]); }}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mode === 'study' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BookOpen size={18} /> STUDY MODE 📚
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar - Types */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">
              {mode === 'texting' ? 'Message Types' : 'Writing Tools'}
            </h3>
            <div className="space-y-1">
              {(mode === 'texting' ? TEXTING_TYPES : STUDY_TYPES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeType === t.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.color}`}>
                    <t.icon size={16} />
                  </div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kid Friendly Mode */}
          <button
            onClick={() => setIsKidFriendly(!isKidFriendly)}
            className={`w-full p-4 rounded-[2rem] border transition-all flex items-center justify-between group ${
              isKidFriendly 
                ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-teal-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isKidFriendly ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Baby size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Simple Mode</p>
                <p className="text-[10px] opacity-70">Kid-friendly English</p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isKidFriendly ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isKidFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Main Input Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-blue-500" /> What do you want to say?
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'texting' ? "e.g. I want to ask her out for coffee..." : "e.g. I need to ask for a 2-day leave..."}
                    className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {mode === 'texting' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} className="text-purple-500" /> Chat Context (Optional)
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Paste the last few messages here for better AI understanding..."
                      className="w-full h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {mode === 'study' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} className="text-blue-500" /> Recipient
                      </label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="e.g. Mr. Smith, Principal..."
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    {activeType === 'email' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={14} className="text-purple-500" /> Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Leave Request, Assignment Help..."
                          className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Quick Templates
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATES[mode].map((tmp, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(tmp.input);
                          setActiveType(tmp.type);
                        }}
                        className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-xs font-medium transition-all flex items-center justify-between group"
                      >
                        {tmp.label}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || (!input.trim() && !context.trim())}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" /> Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate AI Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Smart Refinement Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {SMART_BUTTONS.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleGenerate(btn.id)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full text-xs font-bold hover:border-blue-500 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <btn.icon size={14} className="text-blue-500" />
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6">
                  {results.map((res, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl relative group"
                    >
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(res, i)}
                          className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-gray-500 hover:text-blue-500"
                          title="Copy to Clipboard"
                        >
                          {copiedIndex === i ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        <button
                          onClick={() => downloadText(res)}
                          className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-gray-500 hover:text-purple-500"
                          title="Download as TXT"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                      <div className="pr-20">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {i + 1}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version {i + 1}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {res}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
