import React, { useState, useEffect } from 'react';
import { Phone, Video, Smartphone, Apple, Instagram, MessageCircle, User, Zap, Sparkles, RefreshCw, Skull, Heart, Brain, Laugh, Flame, ArrowRight, Clock, ShieldAlert, BadgeCheck, Camera, Share2, Download, Trash2, Plus, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform, CallType, CallDirection, Call } from '../types';
import confetti from 'canvas-confetti';

interface CallGeneratorProps {
  user: any;
  onStartCall: (call: Call) => void;
}

const PLATFORMS: { id: Platform; label: string; icon: any; color: string }[] = [
  { id: 'ios', label: 'iPhone (iOS)', icon: Apple, color: 'bg-gray-100 text-black' },
  { id: 'android', label: 'Android', icon: Smartphone, color: 'bg-green-100 text-green-600' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500 text-white' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white' },
  { id: 'messenger', label: 'Messenger', icon: MessageCircle, color: 'bg-blue-500 text-white' },
];

const TEMPLATES = [
  { label: 'Mom', emoji: '👩', name: 'Mom', number: '+1 234 567 890', photo: 'https://picsum.photos/seed/mom/200' },
  { label: 'Dad', emoji: '👨', name: 'Dad', number: '+1 234 567 891', photo: 'https://picsum.photos/seed/dad/200' },
  { label: 'Boss', emoji: '💼', name: 'The Boss', number: 'Private Number', photo: 'https://picsum.photos/seed/boss/200' },
  { label: 'Crush', emoji: '😏', name: 'My Crush', number: '+1 987 654 321', photo: 'https://picsum.photos/seed/crush/200' },
  { label: 'Ex', emoji: '💀', name: 'The Ex', number: 'Blocked', photo: 'https://picsum.photos/seed/ex/200' },
  { label: 'Delivery', emoji: '📦', name: 'Delivery Driver', number: '+1 555 0199', photo: 'https://picsum.photos/seed/delivery/200' },
  { label: 'Bank', emoji: '🏦', name: 'Bank Security', number: '800-BANK-SEC', photo: 'https://picsum.photos/seed/bank/200' },
  { label: 'Unknown', emoji: '📵', name: 'Unknown Number', number: 'Hidden', photo: '' },
  { label: 'Celebrity', emoji: '🌟', isCelebrity: true },
];

const CELEBRITIES = [
  { name: 'Drake', username: 'champagnepapi', photo: 'https://picsum.photos/seed/drake/200', verified: true },
  { name: 'MrBeast', username: 'mrbeast', photo: 'https://picsum.photos/seed/mrbeast/200', verified: true },
  { name: 'IShowSpeed', username: 'ishowspeed', photo: 'https://picsum.photos/seed/speed/200', verified: true },
  { name: 'Kai Cenat', username: 'kaicenat', photo: 'https://picsum.photos/seed/kai/200', verified: true },
  { name: 'Cristiano Ronaldo', username: 'cristiano', photo: 'https://picsum.photos/seed/ronaldo/200', verified: true },
  { name: 'Lionel Messi', username: 'leomessi', photo: 'https://picsum.photos/seed/messi/200', verified: true },
  { name: 'Taylor Swift', username: 'taylorswift', photo: 'https://picsum.photos/seed/taylor/200', verified: true },
  { name: 'Elon Musk', username: 'elonmusk', photo: 'https://picsum.photos/seed/elon/200', verified: true },
  { name: 'Ariana Grande', username: 'arianagrande', photo: 'https://picsum.photos/seed/ariana/200', verified: true },
  { name: 'Justin Bieber', username: 'justinbieber', photo: 'https://picsum.photos/seed/justin/200', verified: true },
  { name: 'Selena Gomez', username: 'selenagomez', photo: 'https://picsum.photos/seed/selena/200', verified: true },
  { name: 'The Rock', username: 'therock', photo: 'https://picsum.photos/seed/therock/200', verified: true },
  { name: 'Zendaya', username: 'zendaya', photo: 'https://picsum.photos/seed/zendaya/200', verified: true },
];

export const CallGenerator: React.FC<CallGeneratorProps> = ({ user, onStartCall }) => {
  const [platform, setPlatform] = useState<Platform>('ios');
  const [type, setType] = useState<CallType>('voice');
  const [direction, setDirection] = useState<CallDirection | 'missed'>('incoming');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [username, setUsername] = useState('');
  const [photo, setPhoto] = useState('');
  const [verified, setVerified] = useState(false);
  const [scheduleDelay, setScheduleDelay] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCelebrityList, setShowCelebrityList] = useState(false);

  const handleTemplate = (t: any) => {
    if (t.isCelebrity) {
      setShowCelebrityList(true);
      return;
    }
    setName(t.name);
    setNumber(t.number || '');
    setUsername(t.username || '');
    setPhoto(t.photo || '');
    setVerified(t.verified || false);
  };

  const selectCelebrity = (c: any) => {
    setName(c.name);
    setUsername(c.username);
    setPhoto(c.photo);
    setVerified(c.verified);
    setNumber('');
    setShowCelebrityList(false);
  };

  const startCall = () => {
    const call: Call = {
      id: Math.random().toString(36).substr(2, 9),
      platform,
      type,
      direction: direction === 'missed' ? 'incoming' : direction,
      status: direction === 'missed' ? 'missed' : undefined,
      contactName: name || 'Unknown',
      phoneNumber: number,
      username,
      contactPhoto: photo,
      verified,
      timestamp: new Date(),
    };

    if (scheduleDelay > 0) {
      setIsScheduling(true);
      setCountdown(scheduleDelay);
    } else {
      onStartCall(call);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isScheduling && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isScheduling && countdown === 0) {
      setIsScheduling(false);
      startCall();
    }
    return () => clearInterval(timer);
  }, [isScheduling, countdown]);

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Phone size={40} className="text-blue-600" /> Fake Call Generator 📞🔥
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Create ultra-realistic fake calls for memes, content creation, or escaping awkward situations.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Builder Section */}
        <div className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 relative">
          <AnimatePresence>
            {showCelebrityList && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 bg-white dark:bg-gray-900 rounded-3xl p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-500" /> Select Celebrity
                  </h3>
                  <button 
                    onClick={() => setShowCelebrityList(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <Trash2 size={20} className="text-gray-400 rotate-45" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {CELEBRITIES.map((c) => (
                    <button
                      key={c.username}
                      onClick={() => selectCelebrity(c)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                        <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold truncate w-full">{c.name}</p>
                        <p className="text-[10px] text-gray-500 truncate w-full">@{c.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 1: Choose Platform</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                      platform === p.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                      <p.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Call Type</label>
                <div className="flex gap-2">
                  {(['voice', 'video'] as CallType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all border-2 ${
                        type === t 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                          : 'border-transparent bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {t === 'voice' ? <Phone size={14} className="inline mr-1" /> : <Video size={14} className="inline mr-1" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direction</label>
                <div className="flex gap-2">
                  {(['incoming', 'outgoing', 'missed'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                        direction === d 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                          : 'border-transparent bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 2: Contact Details</label>
              
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleTemplate(t)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                      {photo ? (
                        <img src={photo} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <Camera size={16} className="text-white" />
                      <input type="text" className="hidden" onChange={(e) => setPhoto(e.target.value)} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Caller Name"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={16} className="text-blue-500" />
                    <span className="text-xs font-bold uppercase">Verified Badge</span>
                  </div>
                  <button 
                    onClick={() => setVerified(!verified)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${verified ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${verified ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 3: Schedule Call</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 30, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScheduleDelay(s)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                      scheduleDelay === s 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    {s === 0 ? 'Instant' : `${s}s`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startCall}
              disabled={isScheduling}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {isScheduling ? (
                <>
                  <Clock size={20} className="animate-spin" />
                  Calling in {countdown}s...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Start Fake Call 🔥
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold">Ultra Realistic Simulation</h3>
              <div className="space-y-4">
                {[
                  { title: 'Platform Specific UI', desc: 'Exact replicas of iOS, Android, WhatsApp, and more.', icon: Smartphone },
                  { title: 'Ringtone & Vibration', desc: 'Authentic sounds and haptic feedback for immersion.', icon: Volume2 },
                  { title: 'Video Call Support', desc: 'Full screen video simulation with camera controls.', icon: Video },
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
            <h3 className="font-bold flex items-center gap-2 text-red-500">
              <ShieldAlert size={18} /> Safety Reminder
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This tool is for entertainment purposes only. Do not use to mislead, impersonate, or harm others. Use responsibly for memes and pranks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
