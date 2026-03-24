import React, { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, auth } from '../firebase';
import { Send, CheckCircle, MessageSquare, Mail, User, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Feedback: React.FC = () => {
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: auth.currentUser?.uid || null,
        email,
        message,
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
      setMessage('');
    } catch (err) {
      console.error('Feedback submission failed', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Feedback
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          We'd love to hear from you! Whether it's a bug report, a feature request, or just a friendly hello.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 dark:bg-green-900/20 p-8 rounded-3xl border border-green-200 dark:border-green-800 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Thank you for your feedback!</h2>
            <p className="text-green-700 dark:text-green-500">Your message has been sent to our team. We'll get back to you if needed.</p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              Send another feedback
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} /> Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[150px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Star size={20} className="animate-spin" /> : <Send size={20} />}
              Submit Feedback
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About Creator 👑
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Passionate about building AI tools, apps, and creative platforms that go viral and help people have fun.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">The Team</h2>
            <div className="h-1 w-20 bg-blue-600 rounded-full" />
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-blue-600">Kaveesha</h3>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Founder & Lead Creator</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                I am the founder of ChatFaker AI. My mission is to bridge the gap between AI technology and everyday entertainment. 
                I believe that AI should be accessible, fun, and useful for everyone.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-purple-600">Binul</h3>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Manager</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Binul is one of the key managers here, ensuring everything runs smoothly and helping us scale our vision to reach millions of users worldwide.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex-1">
              <span className="text-2xl font-bold text-blue-600">10k+</span>
              <span className="text-xs text-gray-500">Users</span>
            </div>
             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex-1">
              <span className="text-2xl font-bold text-purple-600">50k+</span>
              <span className="text-xs text-gray-500">Chats Created</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-2xl overflow-hidden group">
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.8rem] overflow-hidden flex items-center justify-center">
              <User size={120} className="text-gray-200 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
        </div>
      </div>

      <div className="bg-gray-900 text-white p-12 rounded-[3rem] space-y-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-bold">Our Vision</h3>
          <p className="text-gray-400 max-w-2xl">
            We're just getting started. In the future, ChatFaker AI will support fake call screens, voice message simulations, 
            and even AI-powered girlfriend/boyfriend chat simulations.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {['AI Chat', 'Fake Calls', 'Voice AI', 'Meme Engine'].map((tag) => (
              <span key={tag} className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/10">{tag}</span>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};
