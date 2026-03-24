import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Smartphone, Apple, Instagram, MessageCircle, User, Zap, Sparkles, RefreshCw, Skull, Heart, Brain, Laugh, Flame, ArrowRight, Clock, ShieldAlert, BadgeCheck, Camera, Share2, Download, Trash2, Plus, Volume2, VolumeX, Mic, MicOff, VideoOff, Grid, MoreHorizontal, PhoneOff, MessageSquare, Info, ChevronDown, Speaker, Bluetooth, PlusCircle, UserPlus, LayoutGrid, CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform, CallType, CallDirection, Call, CallStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { toPng } from 'html-to-image';

interface CallSimulationProps {
  call: Call;
  onEnd: () => void;
  user: any;
}

const RINGTONES = {
  ios: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  android: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
  whatsapp: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  instagram: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  messenger: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
};

export const CallSimulation: React.FC<CallSimulationProps> = ({ call, onEnd, user }) => {
  const [status, setStatus] = useState<CallStatus>(call.status || (call.direction === 'incoming' ? 'ringing' : 'calling'));
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;

    if (status === 'ringing' || status === 'calling') {
      const url = RINGTONES[call.platform as keyof typeof RINGTONES] || RINGTONES.ios;
      audio = new Audio(url);
      audio.loop = true;
      audioRef.current = audio;
      
      const promise = audio.play();
      playPromiseRef.current = promise;
      
      if (promise) {
        promise.catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Audio play failed:", e);
          }
        });
      }
    }

    return () => {
      const currentAudio = audioRef.current;
      const currentPromise = playPromiseRef.current;

      if (currentAudio) {
        if (currentPromise) {
          currentPromise.then(() => {
            currentAudio.pause();
          }).catch(() => {
            // Ignore abort errors
          });
        } else {
          currentAudio.pause();
        }
      }
      
      audioRef.current = null;
      playPromiseRef.current = null;
    };
  }, [status, call.platform]);

  useEffect(() => {
    let timer: any;
    if (status === 'connected') {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setStatus('connected');
  };

  const handleDecline = () => {
    setStatus('ended');
    setTimeout(onEnd, 1000);
  };

  const renderIOS = () => (
    <div className="h-full w-full bg-black/90 backdrop-blur-xl text-white flex flex-col items-center justify-between py-20 px-10 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-medium">{call.contactName}</h2>
        <p className="text-lg text-gray-400">
          {status === 'ringing' ? 'mobile' : status === 'connected' ? formatDuration(duration) : 'calling...'}
        </p>
      </div>

      <div className="w-40 h-40 rounded-full bg-gray-800 overflow-hidden shadow-2xl">
        {call.contactPhoto ? (
          <img src={call.contactPhoto} alt={call.contactName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-6xl font-bold">
            {call.contactName[0]}
          </div>
        )}
      </div>

      {status === 'ringing' ? (
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex flex-col items-center gap-4">
            <button onClick={handleDecline} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <PhoneOff size={32} />
            </button>
            <span className="text-sm font-medium">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <button onClick={handleAccept} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Phone size={32} />
            </button>
            <span className="text-sm font-medium">Accept</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-10 w-full max-w-sm">
          {[
            { icon: MicOff, label: 'mute', active: isMuted, onClick: () => setIsMuted(!isMuted) },
            { icon: Grid, label: 'keypad' },
            { icon: Speaker, label: 'speaker', active: isSpeakerOn, onClick: () => setIsSpeakerOn(!isSpeakerOn) },
            { icon: PlusCircle, label: 'add call' },
            { icon: Video, label: 'FaceTime' },
            { icon: UserPlus, label: 'contacts' },
          ].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <button 
                onClick={btn.onClick}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                  btn.active ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                )}
              >
                <btn.icon size={28} />
              </button>
              <span className="text-[10px] uppercase font-bold tracking-widest">{btn.label}</span>
            </div>
          ))}
          <div className="col-span-3 flex justify-center pt-10">
            <button onClick={handleDecline} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <PhoneOff size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWhatsApp = () => (
    <div className="h-full w-full bg-[#075e54] dark:bg-[#0b141a] text-white flex flex-col items-center justify-between py-20 px-6 font-sans">
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs opacity-80 uppercase tracking-widest">
          <MessageCircle size={14} /> WhatsApp Call
        </div>
        <h2 className="text-2xl font-bold">{call.contactName}</h2>
        <p className="text-sm opacity-80">
          {status === 'ringing' ? 'Ringing...' : status === 'connected' ? formatDuration(duration) : 'Calling...'}
        </p>
      </div>

      <div className="relative">
        <div className="w-48 h-48 rounded-full bg-gray-300 overflow-hidden border-4 border-white/10 shadow-2xl">
          {call.contactPhoto ? (
            <img src={call.contactPhoto} alt={call.contactName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-400 text-6xl font-bold">
              {call.contactName[0]}
            </div>
          )}
        </div>
        {call.verified && (
          <div className="absolute bottom-4 right-4 bg-blue-500 rounded-full p-1 border-2 border-[#075e54]">
            <BadgeCheck size={20} className="text-white" />
          </div>
        )}
      </div>

      <div className="w-full space-y-10">
        {status === 'ringing' ? (
          <div className="flex flex-col items-center gap-8">
            <div className="flex gap-20">
              <button onClick={handleDecline} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <PhoneOff size={28} />
              </button>
              <button onClick={handleAccept} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Phone size={28} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-60">
              <ChevronDown size={16} /> Swipe up to reply
            </div>
          </div>
        ) : (
          <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 flex justify-between items-center">
            <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={cn("p-4 rounded-full", isSpeakerOn ? "bg-white text-black" : "text-white")}>
              <Speaker size={24} />
            </button>
            <button onClick={() => setIsCameraOff(!isCameraOff)} className="p-4 text-white">
              <VideoOff size={24} />
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className={cn("p-4 rounded-full", isMuted ? "bg-white text-black" : "text-white")}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={handleDecline} className="p-4 bg-red-500 rounded-full text-white shadow-lg">
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAndroid = () => (
    <div className="h-full w-full bg-gradient-to-b from-gray-800 to-black text-white flex flex-col items-center justify-between py-20 px-10 font-sans">
      <div className="text-center space-y-2">
        <p className="text-sm text-blue-400 font-medium uppercase tracking-widest">Incoming Call</p>
        <h2 className="text-3xl font-light">{call.contactName}</h2>
        <p className="text-lg text-gray-400">{call.phoneNumber || 'Mobile'}</p>
      </div>

      <div className="w-44 h-44 rounded-full bg-gray-700 overflow-hidden border-2 border-white/5 shadow-2xl">
        {call.contactPhoto ? (
          <img src={call.contactPhoto} alt={call.contactName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-600 text-6xl font-light">
            {call.contactName[0]}
          </div>
        )}
      </div>

      {status === 'ringing' ? (
        <div className="w-full flex justify-between items-center px-4 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white/10" />
          <button onClick={handleDecline} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg z-10">
            <PhoneOff size={32} />
          </button>
          <button onClick={handleAccept} className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg z-10 animate-pulse">
            <Phone size={32} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
          {[
            { icon: MicOff, label: 'Mute', active: isMuted, onClick: () => setIsMuted(!isMuted) },
            { icon: Grid, label: 'Keypad' },
            { icon: Speaker, label: 'Speaker', active: isSpeakerOn, onClick: () => setIsSpeakerOn(!isSpeakerOn) },
            { icon: Plus, label: 'Add call' },
            { icon: Phone, label: 'Hold' },
            { icon: Bluetooth, label: 'Bluetooth' },
          ].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <button 
                onClick={btn.onClick}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-colors border border-white/10",
                  btn.active ? "bg-white text-black" : "bg-transparent hover:bg-white/10"
                )}
              >
                <btn.icon size={24} />
              </button>
              <span className="text-[10px] text-gray-400">{btn.label}</span>
            </div>
          ))}
          <div className="col-span-3 flex justify-center pt-10">
            <button onClick={handleDecline} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <PhoneOff size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInstagram = () => (
    <div className="h-full w-full bg-black text-white flex flex-col items-center justify-between py-20 px-10 font-sans">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-white/10">
          {call.contactPhoto ? (
            <img src={call.contactPhoto} alt={call.contactName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-4xl font-bold">
              {call.contactName[0]}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <h2 className="text-xl font-bold">{call.username || call.contactName}</h2>
            {call.verified && <BadgeCheck size={16} className="text-blue-500 fill-blue-500 text-white" />}
          </div>
          <p className="text-sm text-gray-400">
            {status === 'ringing' ? 'Instagram Audio...' : status === 'connected' ? formatDuration(duration) : 'Calling...'}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-12">
        {status === 'ringing' ? (
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center gap-3">
              <button onClick={handleDecline} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <PhoneOff size={28} />
              </button>
              <span className="text-xs font-medium">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button onClick={handleAccept} className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Phone size={28} />
              </button>
              <span className="text-xs font-medium">Accept</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-full">
            <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={cn("p-2", isSpeakerOn ? "text-blue-500" : "text-white")}>
              <Speaker size={24} />
            </button>
            <button onClick={() => setIsCameraOff(!isCameraOff)} className="p-2 text-white">
              <Video size={24} />
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className={cn("p-2", isMuted ? "text-red-500" : "text-white")}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={handleDecline} className="p-2 bg-red-500 rounded-full text-white">
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderVideoCall = () => (
    <div className="h-full w-full bg-black relative overflow-hidden text-white font-sans">
      {/* Remote Video (Placeholder) */}
      <div className="absolute inset-0 z-0">
        {call.contactPhoto ? (
          <img src={call.contactPhoto} alt="remote" className="w-full h-full object-cover blur-sm opacity-50" />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <User size={100} className="text-gray-800" />
          </div>
        )}
      </div>

      {/* Local Video (Placeholder) */}
      <div className="absolute top-12 right-6 w-32 h-44 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
        {isCameraOff ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <CameraOff size={24} className="text-gray-600" />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <User size={32} className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="absolute top-12 left-6 z-10 space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{call.contactName}</h2>
          {call.verified && <BadgeCheck size={18} className="text-blue-500 fill-blue-500 text-white" />}
        </div>
        <p className="text-sm opacity-80">{status === 'connected' ? formatDuration(duration) : 'Ringing...'}</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 left-0 w-full px-6 z-20">
        {status === 'ringing' ? (
          <div className="flex justify-around items-center">
            <button onClick={handleDecline} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <PhoneOff size={32} />
            </button>
            <button onClick={handleAccept} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Video size={32} />
            </button>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl rounded-full p-4 flex justify-between items-center max-w-sm mx-auto">
            <button className="p-4 text-white hover:bg-white/10 rounded-full transition-colors">
              <LayoutGrid size={24} />
            </button>
            <button onClick={() => setIsCameraOff(!isCameraOff)} className={cn("p-4 rounded-full transition-colors", isCameraOff ? "bg-white text-black" : "text-white")}>
              {isCameraOff ? <CameraOff size={24} /> : <Video size={24} />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className={cn("p-4 rounded-full transition-colors", isMuted ? "bg-white text-black" : "text-white")}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={handleDecline} className="p-4 bg-red-500 rounded-full text-white shadow-lg">
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const captureScreenshot = async () => {
    const el = document.getElementById('call-simulation-screen');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `fake-call-${call.contactName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  const renderMissedCall = () => (
    <div className="h-full w-full bg-black text-white flex flex-col items-center justify-center p-10 font-sans space-y-8">
      <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Missed Call</h4>
              <p className="text-xs text-gray-400">Just now</p>
            </div>
          </div>
          <button onClick={onEnd} className="text-gray-500 hover:text-white">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden">
            {call.contactPhoto ? <img src={call.contactPhoto} alt="p" className="w-full h-full object-cover" /> : <User className="m-auto mt-3 text-gray-600" />}
          </div>
          <div className="flex-1">
            <p className="font-bold">{call.contactName}</p>
            <p className="text-xs text-gray-500">{call.phoneNumber || 'Mobile'}</p>
          </div>
          <button onClick={handleAccept} className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold">Call Back</button>
        </div>
      </div>
      <button onClick={onEnd} className="text-sm text-gray-500 hover:text-white flex items-center gap-2">
        <ArrowRight size={16} /> Back to Dashboard
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center"
    >
      <div id="call-simulation-screen" className="w-full h-full max-w-[500px] relative bg-black shadow-2xl">
        {status === 'missed' ? renderMissedCall() : (
          <>
            {call.type === 'video' ? renderVideoCall() : (
              <>
                {call.platform === 'ios' && renderIOS()}
                {call.platform === 'android' && renderAndroid()}
                {call.platform === 'whatsapp' && renderWhatsApp()}
                {call.platform === 'instagram' && renderInstagram()}
                {call.platform === 'messenger' && renderWhatsApp()}
              </>
            )}
          </>
        )}

        {/* Watermark for free users */}
        {!user?.isPremium && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-[110] pointer-events-none">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/50">Created with ChatFaker AI</p>
          </div>
        )}

        {/* Action Overlay (Hidden in screenshot if needed, but usually users want it) */}
        <div className="absolute top-4 right-4 z-[120] flex flex-col gap-2">
          <button 
            onClick={captureScreenshot}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            title="Download Screenshot"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={onEnd}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-500 transition-colors"
            title="End Simulation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
