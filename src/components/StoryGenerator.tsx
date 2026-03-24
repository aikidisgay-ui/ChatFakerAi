import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Heart, Brain, Skull, Laugh, Flame, MessageSquare, ArrowRight, Zap, Share2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateChatStory } from '../services/geminiService';
import { Chat, Platform } from '../types';
import confetti from 'canvas-confetti';

interface StoryGeneratorProps {
  onGenerate: (chat: Partial<Chat>) => void;
  user: any;
}

const TONES = [
  { id: 'funny', label: 'Funny', icon: Laugh, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20', emoji: '😂' },
  { id: 'savage', label: 'Savage', icon: Skull, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', emoji: '💀' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20', emoji: '😏' },
  { id: 'sad', label: 'Sad', icon: Brain, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', emoji: '😔' },
  { id: 'dramatic', label: 'Dramatic', icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', emoji: '🎭' },
];

const TEMPLATES = [
  { label: 'Breakup', emoji: '💔', scenario: 'A funny breakup chat where one person is totally over it.' },
  { label: 'Crush Confession', emoji: '😏', scenario: 'A romantic confession that goes surprisingly well.' },
  { label: 'School Fight', emoji: '💀', scenario: 'A savage school drama between two former best friends.' },
  { label: 'Best Friend Drama', emoji: '😂', scenario: 'A hilarious misunderstanding between best friends.' },
  { label: 'Toxic Relationship', emoji: '🔥', scenario: 'A dramatic and toxic argument about who liked whose photo.' },
];

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onGenerate, user }) => {
  const [scenario, setScenario] = useState('');
  const [selectedTone, setSelectedTone] = useState('funny');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;

    // Check limits for free users
    if (!user?.isPremium) {
      const today = new Date().toDateString();
      const count = parseInt(localStorage.getItem(`gen_count_${today}`) || '0');
      if (count >= 5) {
        setError('Daily limit reached! Upgrade to Pro for unlimited stories.');
        return;
      }
      localStorage.setItem(`gen_count_${today}`, (count + 1).toString());
    }

    setIsLoading(true);
    setError(null);

    try {
      const story = await generateChatStory(scenario, selectedTone);
      
      const newChat: Partial<Chat> = {
        platform: selectedPlatform,
        contactName: story.contactName,
        messages: story.messages.map((m, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: m.text,
          sender: (m as any).sender,
          timestamp: new Date(Date.now() - (story.messages.length - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: (m as any).reactions
        })),
        settings: {
          battery: 85,
          signal: 4,
          wifi: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showTyping: false,
          showOnline: true,
          showLastSeen: true,
          lastSeen: 'Just now',
          verified: false
        }
      };

      onGenerate(newChat);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Sparkles size={40} className="text-blue-600" /> AI Chat Story Generator 🔥
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Generate full realistic chat conversations automatically using AI. Just enter a scenario and watch the magic happen.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} /> Step 1: Enter Scenario
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="e.g. A funny breakup chat where one person is totally over it..."
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setScenario(t.scenario)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} /> Step 2: Select Tone
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                      selectedTone === tone.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tone.icon size={20} className={tone.color.split(' ')[0]} />
                    <span className="text-[10px] font-bold uppercase">{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ArrowRight size={14} /> Step 3: Choose Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['whatsapp', 'instagram', 'messenger', 'imessage'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`p-3 rounded-2xl text-[10px] font-bold uppercase transition-all border-2 ${
                      selectedPlatform === p 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-medium flex items-center gap-2">
                <Skull size={16} /> {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !scenario.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {error ? 'Try Again' : 'Generate Chat Story 🔥'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedTone('savage'); handleGenerate(); }}
                disabled={isLoading || !scenario.trim()}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
              >
                Make it more savage 💀
              </button>
              <button
                onClick={() => { setSelectedTone('romantic'); handleGenerate(); }}
                disabled={isLoading || !scenario.trim()}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-bold uppercase hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 transition-all"
              >
                Make it more romantic 😏
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold">Why AI Stories?</h3>
              <div className="space-y-4">
                {[
                  { title: 'Viral Content', desc: 'Generate chats that are perfect for TikTok, Reels, and Shorts.', icon: Flame },
                  { title: 'Realistic Flow', desc: 'AI understands context, slang, and emotional nuances.', icon: MessageSquare },
                  { title: 'Instant Edits', desc: 'Load directly into the builder to tweak every detail.', icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" /> Membership Perks
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-xs font-medium">Daily Generations</span>
                <span className="text-xs font-bold">{user?.isPremium ? 'Unlimited' : '5 / Day'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-xs font-medium">AI Quality</span>
                <span className="text-xs font-bold">{user?.isPremium ? 'Ultra HD' : 'Standard'}</span>
              </div>
            </div>
            {!user?.isPremium && (
              <button className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-xs hover:bg-yellow-500 transition-colors">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
