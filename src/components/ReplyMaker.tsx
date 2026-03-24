import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { generateReplies, analyzeScreenshot } from '../services/geminiService';
import { Tone, UserProfile } from '../types';
import { Sparkles, Upload, Copy, RefreshCw, MessageSquare, Zap, Heart, Brain, Skull, Laugh, Briefcase, Smile, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TONES: { id: Tone; label: string; icon: any; color: string }[] = [
  { id: 'rizz', label: 'Rizz', icon: Heart, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'funny', label: 'Funny', icon: Laugh, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'savage', label: 'Savage', icon: Skull, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  { id: 'smart', label: 'Smart', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'friendly', label: 'Friendly', icon: Smile, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  { id: 'professional', label: 'Pro', icon: Briefcase, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
];

export const ReplyMaker: React.FC = () => {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<Tone>('rizz');
  const [replies, setReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await analyzeScreenshot(base64);
      setMessage(result.message);
      setTone(result.suggestedTone);
      setIsAnalyzing(false);
      handleGenerate(result.message, result.suggestedTone);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleGenerate = async (msg: string = message, t: Tone = tone) => {
    if (!msg.trim()) return;
    setIsLoading(true);
    const result = await generateReplies(msg, t);
    setReplies(result);
    setIsLoading(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          AI Reply Maker 😏🔥
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Upload a screenshot or paste a message to get the perfect AI-generated response. 
          Choose your vibe and let the AI do the rizzing.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div {...getRootProps()} className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
            isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-800 hover:border-blue-400"
          )}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                <Upload size={24} />
              </div>
              {isAnalyzing ? (
                <p className="text-sm font-medium animate-pulse">Analyzing screenshot...</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drop a screenshot here</p>
                  <p className="text-xs text-gray-400">or click to browse files</p>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400">
              <MessageSquare size={18} />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the message you received..."
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                    tone === t.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-gray-50 dark:bg-gray-800"
                  )}
                >
                  <t.icon size={18} className={cn(t.color.split(' ')[0])} />
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !message.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
            Generate Replies
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-yellow-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">AI Suggestions</h3>
          </div>

          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {replies.length > 0 ? (
                replies.map((reply, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-start gap-4 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="flex-1 text-sm leading-relaxed">{reply}</p>
                    <button
                      onClick={() => copyToClipboard(reply, idx)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {copiedIndex === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Sparkles size={32} />
                  </div>
                  <p className="text-sm">Your AI-generated replies will appear here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {replies.length > 0 && (
            <button
              onClick={() => handleGenerate()}
              className="mt-6 text-sm font-bold text-blue-600 hover:underline flex items-center gap-2 justify-center"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
