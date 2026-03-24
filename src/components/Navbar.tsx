import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MessageSquare, Sparkles, TrendingUp, Info, User, LogOut, LogIn, Menu, X, Zap, Camera, Phone, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: any) => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage, user, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: MessageSquare },
    { id: 'create', label: 'Create Chat', icon: Zap },
    { id: 'call', label: 'Fake Calls 📞', icon: Phone },
    { id: 'writing', label: 'AI Writing Assistant 😏📚', icon: BookOpen },
    { id: 'story', label: 'AI Story Generator 🔥', icon: Sparkles },
    { id: 'reply', label: 'Reply Maker 😏', icon: MessageSquare },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'feedback', label: 'Feedback', icon: Info },
    { id: 'about', label: 'About Creator', icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-[100]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setActivePage('home')} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none">ChatFaker</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Studio</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activePage === item.id ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth / Profile */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold">{user.displayName}</span>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", user.isPremium ? "text-yellow-500" : "text-gray-400")}>
                  {user.isPremium ? 'Pro Member' : 'Free Plan'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-2 border-white dark:border-gray-900 shadow-lg">
                {user.photoURL ? <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400 m-auto" />}
              </div>
              <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg"
            >
              <LogIn size={18} />
              Login
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-500">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all",
                    activePage === item.id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-gray-500"
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
