import React from 'react';
import { Chat, ChatMessage, Platform } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Battery, Signal, Wifi, Check, CheckCheck, MoreVertical, Phone, Video, Info, ArrowLeft, Camera, Mic, Smile, Plus, Send, Image as ImageIcon, BadgeCheck, Paperclip, ChevronLeft, Home, Square } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatPreviewProps {
  chat: Chat;
  id?: string;
  onReact?: (messageId: string, emoji: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const WifiIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12.5a10 10 0 0 1 14 0" />
    <path d="M8.5 16a5 5 0 0 1 7 0" />
    <path d="M12 19.5h.01" />
  </svg>
);

const SignalIcon = ({ level, className }: { level: number, className?: string }) => (
  <div className={cn("flex items-end gap-0.5", className)}>
    {[1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className={cn(
          "w-[2px] rounded-full bg-current",
          i === 1 ? "h-[4px]" : i === 2 ? "h-[6px]" : i === 3 ? "h-[8px]" : "h-[10px]",
          level >= i ? "opacity-100" : "opacity-30"
        )} 
      />
    ))}
  </div>
);

const BatteryIcon = ({ level, className }: { level: number, className?: string }) => (
  <div className={cn("relative border-[1.2px] border-current rounded-[2px] p-[1px] flex items-center", className)}>
    <div 
      className={cn("h-full rounded-[0.5px]", level <= 20 ? "bg-red-500" : "bg-current")} 
      style={{ width: `${level}%` }} 
    />
    <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] bg-current rounded-r-[0.5px]" />
  </div>
);

export const ChatPreview: React.FC<ChatPreviewProps> = ({ chat, id, onReact }) => {
  const { platform, contactName, contactPhoto, messages, settings } = chat;
  const [reactingTo, setReactingTo] = React.useState<string | null>(null);

  const renderReactions = (msg: ChatMessage) => {
    if (!msg.reactions || msg.reactions.length === 0) return null;
    return (
      <div className={cn(
        "absolute -bottom-2.5 flex items-center gap-0.5 bg-white dark:bg-[#202c33] rounded-full px-1.5 py-0.5 shadow-md border border-gray-100 dark:border-[#3b4a54] z-10 animate-in zoom-in duration-200",
        msg.sender === 'me' ? "right-1" : "left-1"
      )}>
        <div className="flex -space-x-1">
          {msg.reactions.slice(0, 3).map((r, i) => (
            <span key={i} className="text-[11px] leading-none select-none">{r}</span>
          ))}
        </div>
        {msg.reactions.length > 1 && (
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 ml-0.5">
            {msg.reactions.length}
          </span>
        )}
      </div>
    );
  };

  const renderReactionPicker = (msgId: string, sender: 'me' | 'them') => {
    if (reactingTo !== msgId) return null;
    return (
      <div className={cn(
        "absolute -top-14 bg-white dark:bg-[#233138] rounded-full px-3 py-2 shadow-2xl border border-gray-100 dark:border-[#3b4a54] z-40 flex gap-3 items-center animate-in fade-in slide-in-from-bottom-2 duration-200",
        sender === 'me' ? "right-0" : "left-0"
      )}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onReact?.(msgId, emoji);
              setReactingTo(null);
            }}
            className="hover:scale-125 active:scale-90 transition-transform text-2xl leading-none"
          >
            {emoji}
          </button>
        ))}
        <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
        <button className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Plus size={14} />
        </button>
      </div>
    );
  };
  const renderStatus = (status?: string) => {
    if (platform === 'whatsapp') {
      if (status === 'sent') return <Check size={14} className="text-gray-400" />;
      if (status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />;
      if (status === 'read') return <CheckCheck size={14} className="text-blue-500" />;
    }
    return null;
  };

  const renderWhatsApp = () => (
    <div className="flex flex-col h-full bg-[#e5ddd5] dark:bg-[#0b141a] overflow-hidden font-sans relative">
      {/* Status Bar Background (Darker Green) */}
      <div className="h-7 bg-[#054d44] dark:bg-[#121b22] w-full absolute top-0 left-0 z-30" />
      
      {/* Header */}
      <div className="bg-[#075e54] dark:bg-[#202c33] text-white pt-7 pb-3 px-3 flex items-center gap-2 shadow-md z-10 h-[88px]">
        <ArrowLeft size={20} className="cursor-pointer" />
        <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 cursor-pointer">
          {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">{contactName[0]}</div>}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer flex flex-col justify-center">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold truncate text-[15px] leading-tight">{contactName}</h3>
            {settings.verified && <BadgeCheck size={14} className="text-blue-400 fill-blue-400 text-white" />}
          </div>
          <div className="h-3.5 flex items-center">
            {settings.showOnline ? (
              <p className="text-[11px] opacity-90 leading-none">online</p>
            ) : settings.showLastSeen && settings.lastSeen ? (
              <p className="text-[10px] opacity-80 truncate leading-none">last seen {settings.lastSeen}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-5 items-center pr-1">
          <Phone size={18} className="cursor-pointer" />
          <Video size={20} className="cursor-pointer" />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2 relative" 
        style={{ 
          backgroundImage: settings.wallpaper ? `url(${settings.wallpaper})` : 'none', 
          backgroundSize: 'cover',
          backgroundColor: settings.wallpaper ? 'transparent' : undefined
        }}
        onClick={() => setReactingTo(null)}
      >
        {reactingTo && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-20 animate-in fade-in duration-300" />
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full", 
              msg.sender === 'me' ? "justify-end" : "justify-start",
              msg.reactions && msg.reactions.length > 0 && "mb-3",
              reactingTo === msg.id && "z-30 relative"
            )}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (onReact) setReactingTo(reactingTo === msg.id ? null : msg.id);
              }}
              className={cn(
                "max-w-[85%] p-1.5 rounded-lg shadow-sm relative cursor-pointer transition-all",
                msg.sender === 'me' ? "bg-[#dcf8c6] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none text-black dark:text-white",
                reactingTo === msg.id && "scale-[1.02] z-40"
              )}
            >
              {renderReactionPicker(msg.id, msg.sender)}
              {msg.image && <img src={msg.image} alt="attachment" className="rounded mb-1 max-w-full" />}
              <div className="flex flex-wrap items-end gap-2 pr-1">
                <p className="text-[14px] leading-tight mb-1 ml-1">{msg.text}</p>
                <div className="flex items-center gap-1 ml-auto pb-0.5">
                  <span className="text-[9px] opacity-60">{msg.timestamp}</span>
                  {msg.sender === 'me' && renderStatus(msg.status)}
                </div>
              </div>
              {renderReactions(msg)}
            </div>
          </div>
        ))}
        {settings.showTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#202c33] px-3 py-1.5 rounded-lg rounded-tl-none shadow-sm">
              <p className="text-[11px] italic opacity-70">typing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 bg-transparent flex items-center gap-1.5 pb-4">
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-3 py-2 flex items-center gap-2 shadow-sm">
          <Smile size={22} className="text-gray-500 cursor-pointer" />
          <div className="flex-1 text-[15px] text-gray-500">
            Message
          </div>
          <Paperclip size={20} className="text-gray-500 -rotate-45 cursor-pointer" />
          <Camera size={22} className="text-gray-500 cursor-pointer" />
        </div>
        <div className="w-11 h-11 bg-[#075e54] dark:bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-md cursor-pointer">
          <Mic size={20} />
        </div>
      </div>

      {/* Android Navigation Bar */}
      <div className="h-12 bg-white dark:bg-black flex justify-around items-center border-t dark:border-gray-800">
        <Square size={14} className="text-gray-400 rotate-90" />
        <Home size={16} className="text-gray-400" />
        <ChevronLeft size={20} className="text-gray-400" />
      </div>
    </div>
  );

  const renderIMessage = () => (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden font-sans relative">
      {/* Header */}
      <div className="bg-gray-50/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md pt-10 pb-2 px-4 border-b dark:border-gray-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-1 text-blue-500 cursor-pointer">
          <ChevronLeft size={28} strokeWidth={2.5} />
          <span className="text-[17px]">Filters</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden mb-0.5">
            {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold text-xs">{contactName[0]}</div>}
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-[11px] font-medium text-gray-900 dark:text-white">{contactName}</span>
            <ChevronLeft size={10} className="-rotate-90 text-gray-400" />
          </div>
        </div>
        <div className="w-16 flex justify-end">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-500 cursor-pointer">
            <Video size={16} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" onClick={() => setReactingTo(null)}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex flex-col w-full", 
              msg.sender === 'me' ? "items-end" : "items-start",
              msg.reactions && msg.reactions.length > 0 && "mb-2",
              reactingTo === msg.id && "z-30 relative"
            )}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (onReact) setReactingTo(reactingTo === msg.id ? null : msg.id);
              }}
              className={cn(
                "max-w-[75%] px-3 py-2 rounded-2xl relative cursor-pointer transition-all",
                msg.sender === 'me' ? "bg-blue-500 text-white rounded-tr-sm" : "bg-gray-200 dark:bg-[#262629] text-black dark:text-white rounded-tl-sm",
                reactingTo === msg.id && "scale-[1.05] z-40"
              )}
            >
              {renderReactionPicker(msg.id, msg.sender)}
              {msg.image && <img src={msg.image} alt="attachment" className="rounded-lg mb-2 max-w-full" />}
              <p className="text-[15px] leading-snug">{msg.text}</p>
              {renderReactions(msg)}
            </div>
            {msg.sender === 'me' && msg.status === 'read' && (
              <span className="text-[10px] text-gray-400 mt-1 mr-1">Read</span>
            )}
          </div>
        ))}
        {settings.showTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-[#262629] px-3 py-2 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 pb-8 flex items-center gap-2">
        <Plus size={24} className="text-gray-500 cursor-pointer" />
        <div className="flex-1 bg-gray-100 dark:bg-[#1c1c1e] border dark:border-gray-800 rounded-full px-3 py-1.5 flex items-center gap-2">
          <div className="flex-1 text-[15px] text-gray-400">iMessage</div>
          <Mic size={20} className="text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* iOS Home Indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black dark:bg-white rounded-full opacity-20" />
    </div>
  );

  const renderMessenger = () => (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden font-sans relative">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md pt-10 pb-2 px-3 border-b dark:border-gray-800 flex items-center gap-3 z-10 h-[84px]">
        <ArrowLeft size={24} className="text-blue-500 cursor-pointer" />
        <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden relative flex-shrink-0 cursor-pointer">
          {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">{contactName[0]}</div>}
          {settings.showOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />}
        </div>
        <div className="flex-1 cursor-pointer flex flex-col justify-center">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-[15px] dark:text-white truncate leading-tight">{contactName}</h3>
            {settings.verified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500 text-white" />}
          </div>
          <div className="h-3.5 flex items-center">
            {settings.showOnline ? (
              <p className="text-[11px] text-gray-500 leading-none">Active now</p>
            ) : settings.showLastSeen && settings.lastSeen ? (
              <p className="text-[11px] text-gray-500 leading-none">Active {settings.lastSeen}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-4 text-blue-500 items-center">
          <Phone size={20} fill="currentColor" className="cursor-pointer" />
          <Video size={22} fill="currentColor" className="cursor-pointer" />
          <Info size={22} fill="currentColor" className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2 relative" 
        style={{ backgroundImage: settings.wallpaper ? `url(${settings.wallpaper})` : 'none', backgroundSize: 'cover' }}
        onClick={() => setReactingTo(null)}
      >
        {reactingTo && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-20 animate-in fade-in duration-300" />
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex items-end gap-2", 
              msg.sender === 'me' ? "flex-row-reverse" : "flex-row",
              msg.reactions && msg.reactions.length > 0 && "mb-3",
              reactingTo === msg.id && "z-30 relative"
            )}
          >
            {msg.sender === 'them' && (
              <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-[10px] font-bold">{contactName[0]}</div>}
              </div>
            )}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (onReact) setReactingTo(reactingTo === msg.id ? null : msg.id);
              }}
              className={cn(
                "max-w-[70%] px-3 py-2 rounded-2xl relative cursor-pointer transition-all",
                msg.sender === 'me' ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-none",
                reactingTo === msg.id && "scale-[1.02] z-40"
              )}
            >
              {renderReactionPicker(msg.id, msg.sender)}
              {msg.image && <img src={msg.image} alt="attachment" className="rounded-xl mb-1 max-w-full" />}
              <p className="text-[15px]">{msg.text}</p>
              {renderReactions(msg)}
            </div>
          </div>
        ))}
        {settings.showTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-[10px] font-bold">{contactName[0]}</div>}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 pb-4 flex items-center gap-2">
        <Plus size={22} className="text-blue-500 cursor-pointer" />
        <Camera size={22} className="text-blue-500 cursor-pointer" />
        <ImageIcon size={22} className="text-blue-500 cursor-pointer" />
        <Mic size={22} className="text-blue-500 cursor-pointer" />
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-[15px] text-gray-400 flex items-center justify-between">
          <span>Aa</span>
          <Smile size={20} />
        </div>
        <Send size={22} className="text-blue-500 cursor-pointer" />
      </div>

      {/* Android Navigation Bar */}
      <div className="h-12 bg-white dark:bg-black flex justify-around items-center border-t dark:border-gray-800">
        <Square size={14} className="text-gray-400 rotate-90" />
        <Home size={16} className="text-gray-400" />
        <ChevronLeft size={20} className="text-gray-400" />
      </div>
    </div>
  );

  const renderInstagram = () => (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden font-sans relative">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md pt-10 pb-2 px-3 border-b dark:border-gray-800 flex items-center gap-3 z-10 h-[84px]">
        <ArrowLeft size={24} className="cursor-pointer dark:text-white" />
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 cursor-pointer">
          {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-xs font-bold">{contactName[0]}</div>}
        </div>
        <div className="flex-1 cursor-pointer flex flex-col justify-center">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-[14px] dark:text-white truncate leading-tight">{contactName}</h3>
            {settings.verified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500 text-white" />}
          </div>
          <div className="h-3.5 flex items-center">
            {settings.showOnline ? (
              <p className="text-[11px] text-gray-500 leading-none">Active now</p>
            ) : settings.showLastSeen && settings.lastSeen ? (
              <p className="text-[11px] text-gray-500 leading-none">Active {settings.lastSeen}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-5 items-center pr-1 dark:text-white">
          <Phone size={22} className="cursor-pointer" />
          <Video size={24} className="cursor-pointer" />
          <Info size={22} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 relative" 
        style={{ backgroundImage: settings.wallpaper ? `url(${settings.wallpaper})` : 'none', backgroundSize: 'cover' }}
        onClick={() => setReactingTo(null)}
      >
        {reactingTo && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-20 animate-in fade-in duration-300" />
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex items-end gap-2", 
              msg.sender === 'me' ? "flex-row-reverse" : "flex-row",
              msg.reactions && msg.reactions.length > 0 && "mb-3",
              reactingTo === msg.id && "z-30 relative"
            )}
          >
            {msg.sender === 'them' && (
              <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-[10px] font-bold">{contactName[0]}</div>}
              </div>
            )}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (onReact) setReactingTo(reactingTo === msg.id ? null : msg.id);
              }}
              className={cn(
                "max-w-[70%] px-4 py-2 rounded-[22px] relative cursor-pointer transition-all",
                msg.sender === 'me' ? "bg-[#3797f0] text-white rounded-br-none" : "border dark:border-gray-800 text-black dark:text-white rounded-bl-none",
                reactingTo === msg.id && "scale-[1.02] z-40"
              )}
            >
              {renderReactionPicker(msg.id, msg.sender)}
              {msg.image && <img src={msg.image} alt="attachment" className="rounded-lg mb-2 max-w-full" />}
              <p className="text-[15px]">{msg.text}</p>
              {renderReactions(msg)}
            </div>
          </div>
        ))}
        {settings.showTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              {contactPhoto ? <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-[10px] font-bold">{contactName[0]}</div>}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 pb-6">
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#121212] border dark:border-gray-800 rounded-full px-4 py-2">
          <div className="w-8 h-8 bg-[#3797f0] rounded-full flex items-center justify-center text-white cursor-pointer">
            <Camera size={18} fill="currentColor" />
          </div>
          <div className="flex-1 text-[15px] text-gray-400">
            Message...
          </div>
          <div className="flex gap-3 dark:text-white items-center">
            <Mic size={22} className="cursor-pointer" />
            <ImageIcon size={22} className="cursor-pointer" />
            <Plus size={22} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Android Navigation Bar */}
      <div className="h-12 bg-white dark:bg-black flex justify-around items-center border-t dark:border-gray-800">
        <Square size={14} className="text-gray-400 rotate-90" />
        <Home size={16} className="text-gray-400" />
        <ChevronLeft size={20} className="text-gray-400" />
      </div>
    </div>
  );

  return (
    <div id={id} className="w-full max-w-[420px] aspect-[9/19] rounded-[3rem] border-[8px] border-gray-800 dark:border-gray-900 overflow-hidden shadow-2xl relative bg-black">
      {/* Status Bar */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-7 flex justify-between items-center px-6 text-[11px] font-semibold z-50 transition-colors duration-300",
        platform === 'whatsapp' ? "text-white" : "text-black dark:text-white"
      )}>
        <div className="w-16 flex justify-start">
          <span className="tracking-tight">{settings.time}</span>
        </div>
        
        <div className="flex items-center gap-1.5 w-24 justify-end">
          <SignalIcon level={settings.signal} className="w-3.5 h-3.5" />
          {settings.wifi && <WifiIcon className="w-3.5 h-3.5" />}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold">{settings.battery}%</span>
            <BatteryIcon level={settings.battery} className="w-5 h-2.5" />
          </div>
        </div>
      </div>
      
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-40" />

      {/* Content */}
      <div className="h-full">
        {platform === 'whatsapp' && renderWhatsApp()}
        {platform === 'imessage' && renderIMessage()}
        {platform === 'messenger' && renderMessenger()}
        {platform === 'instagram' && renderInstagram()}
      </div>
    </div>
  );
};
