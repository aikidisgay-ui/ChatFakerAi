import React, { useState, useEffect } from 'react';
import { auth, signInWithPopup, googleProvider, signOut, onSnapshot, doc, db, setDoc, serverTimestamp } from './firebase';
import { UserProfile, Chat, Call } from './types';
import { Navbar } from './components/Navbar';
import { ChatBuilder } from './components/ChatBuilder';
import { ReplyMaker } from './components/ReplyMaker';
import { StoryGenerator } from './components/StoryGenerator';
import { WritingAssistant } from './components/WritingAssistant';
import { CallGenerator } from './components/CallGenerator';
import { CallSimulation } from './components/CallSimulation';
import { Trending } from './components/Trending';
import { Feedback, About } from './components/AboutFeedback';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, Zap, MessageSquare, TrendingUp, Info, User, LogOut, LogIn, Flame, Phone, BookOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'create' | 'reply' | 'story' | 'call' | 'trending' | 'feedback' | 'about' | 'writing'>('home');
  const [generatedChat, setGeneratedChat] = useState<Partial<Chat> | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      // Cleanup previous user listener if it exists
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot correctly as a listener
        unsubscribeUser = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as UserProfile);
          } else {
            // If user doesn't exist in Firestore yet, create them
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              isPremium: false,
              createdAt: serverTimestamp()
            };
            setDoc(userRef, newUser).catch(err => console.error("Error creating user profile:", err));
            setUser(newUser);
          }
        }, (error) => {
          console.error("User profile listener error:", error);
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home onStart={() => setActivePage('create')} onNavigate={setActivePage} />;
      case 'create':
        return <ChatBuilder initialChat={generatedChat as any} />;
      case 'reply':
        return <ReplyMaker />;
      case 'story':
        return (
          <StoryGenerator 
            user={user} 
            onGenerate={(chat) => {
              setGeneratedChat(chat);
              setActivePage('create');
            }} 
          />
        );
      case 'call':
        return <CallGenerator user={user} onStartCall={setActiveCall} />;
      case 'writing':
        return <WritingAssistant user={user} />;
      case 'trending':
        return <Trending />;
      case 'feedback':
        return <Feedback />;
      case 'about':
        return <About />;
      default:
        return <Home onStart={() => setActivePage('create')} onNavigate={setActivePage} />;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">ChatFaker AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 selection:bg-blue-500/30">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
      
      <main className="pt-24 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {activeCall && (
          <CallSimulation 
            call={activeCall} 
            user={user}
            onEnd={() => setActiveCall(null)} 
          />
        )}
      </AnimatePresence>

      {/* Safety Disclaimer */}
      <div className="fixed bottom-0 left-0 w-full bg-yellow-500/10 backdrop-blur-md border-t border-yellow-500/20 p-2 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">
          <ShieldAlert size={14} />
          This tool is for entertainment purposes only. Do not use to mislead or harm others.
        </div>
      </div>
    </div>
  );
}

const Home = ({ onStart, onNavigate }: { onStart: () => void, onNavigate: (page: any) => void }) => (
  <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-24">
    {/* Hero Section */}
    <div className="text-center space-y-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/10 to-transparent blur-[120px] -z-10" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800"
      >
        <Sparkles size={14} /> The Future of Chat Simulation
      </motion.div>
      <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-none">
        Create Realistic <br />
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Fake Chats
        </span>
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Generate stunningly realistic chat conversations for memes, storytelling, or content creation. 
        Powered by AI to help you reply smarter and faster.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button 
          onClick={onStart}
          className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Start Creating Free
        </button>
        <button 
          onClick={() => onNavigate('call')}
          className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5 text-green-500" />
          Fake Call Generator
        </button>
        <button 
          onClick={() => onNavigate('story')}
          className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Story Generator
        </button>
        <button 
          onClick={() => onNavigate('writing')}
          className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5 text-purple-500" />
          AI Writing Assistant
        </button>
      </div>
    </div>

    {/* Features Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { 
          title: 'Extreme Realism', 
          desc: 'Identical UI for WhatsApp, iMessage, and Messenger. Every detail matters.',
          icon: Zap,
          color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        },
        { 
          title: 'Fake Call Pro', 
          desc: 'Simulate ultra-realistic calls with iOS, Android, and WhatsApp UIs.',
          icon: Phone,
          color: 'text-green-500 bg-green-50 dark:bg-green-900/20'
        },
        { 
          title: 'AI Story Generator', 
          desc: 'Generate full realistic chat conversations automatically using AI scenarios.',
          icon: Flame,
          color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
        },
        { 
          title: 'Viral Export', 
          desc: 'High-resolution PNG/JPG exports ready for TikTok, Instagram, and X.',
          icon: TrendingUp,
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
        }
      ].map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-4 group hover:border-blue-500/50 transition-colors"
        >
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", f.color)}>
            <f.icon size={28} />
          </div>
          <h3 className="text-xl font-bold">{f.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="md:col-span-2 lg:col-span-4 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] text-white shadow-xl space-y-4 group cursor-pointer"
        onClick={() => onNavigate('writing')}
      >
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">New Feature 🔥</div>
        </div>
        <div>
          <h3 className="text-2xl font-black">AI Texting & Writing Assistant 😏📚</h3>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
            Master your social life with Rizz Mode or crush your school work with Study Mode. 
            The ultimate AI companion for messages, emails, letters, and notes.
          </p>
        </div>
      </motion.div>
    </div>

    {/* Social Proof / Stats */}
    <div className="bg-gray-900 text-white p-12 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
      <div className="relative z-10 space-y-4">
        <h2 className="text-4xl font-bold">Join 10,000+ Creators</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          From meme lords to professional storytellers, ChatFaker AI is the #1 choice for realistic chat simulations.
        </p>
        <div className="flex justify-center gap-12 pt-8">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">500k+</span>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Exports</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">4.9/5</span>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Rating</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">24/7</span>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">AI Support</span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50" />
    </div>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
