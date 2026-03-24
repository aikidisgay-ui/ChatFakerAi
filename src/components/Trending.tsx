import React, { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, limit, getDocs, onSnapshot } from '../firebase';
import { Chat } from '../types';
import { ChatPreview } from './ChatPreview';
import { Heart, Share2, TrendingUp, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Trending: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'newest'>('trending');

  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('isPublic', '==', true),
      orderBy(filter === 'trending' ? 'likes' : 'createdAt', 'desc'),
      limit(12)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
            <Flame size={32} className="text-orange-500" /> Trending Chats
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Discover the most viral and funniest fake chats from the community.</p>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          <button
            onClick={() => setFilter('trending')}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all",
              filter === 'trending' ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <TrendingUp size={16} /> Trending
          </button>
          <button
            onClick={() => setFilter('newest')}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all",
              filter === 'newest' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Clock size={16} /> Newest
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[9/19] bg-gray-100 dark:bg-gray-800 rounded-[3rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative flex flex-col items-center"
              >
                <div className="transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                  <ChatPreview chat={chat} />
                </div>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {chat.contactPhoto && <img src={chat.contactPhoto} alt="profile" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[80px]">{chat.contactName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-xs font-bold text-red-500 hover:scale-110 transition-transform">
                        <Heart size={14} fill={chat.likes > 0 ? "currentColor" : "none"} />
                        {chat.likes}
                      </button>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && chats.length === 0 && (
        <div className="text-center py-20 space-y-4 opacity-50">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <Flame size={40} />
          </div>
          <p className="text-lg font-medium">No public chats yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
