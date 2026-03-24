import React, { useState, useEffect } from 'react';
import { Chat, ChatMessage, Platform, Sender, MessageStatus } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Send, User, Settings, Smartphone, Palette, Save, Download, Share2 } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { ChatPreview } from './ChatPreview';
import { toPng } from 'html-to-image';
import { db, collection, addDoc, serverTimestamp, auth } from '../firebase';
import confetti from 'canvas-confetti';

interface ChatBuilderProps {
  initialChat?: Chat;
  onSave?: (chat: Chat) => void;
}

const DEFAULT_CHAT: Chat = {
  id: '',
  ownerId: '',
  platform: 'whatsapp',
  contactName: 'Kaveesha',
  messages: [
    { id: '1', text: 'Hey there!', sender: 'them', timestamp: '10:00 AM', status: 'read' },
    { id: '2', text: 'Hi! How are you?', sender: 'me', timestamp: '10:01 AM', status: 'read' }
  ],
  settings: {
    battery: 85,
    signal: 4,
    wifi: true,
    time: '10:02 AM',
    showTyping: false,
    showOnline: true,
    showLastSeen: false,
    lastSeen: 'today at 10:00 AM',
    verified: false
  },
  isPublic: false,
  likes: 0,
  createdAt: null
};

export const ChatBuilder: React.FC<ChatBuilderProps> = ({ initialChat, onSave }) => {
  const [chat, setChat] = useState<Chat>(initialChat || DEFAULT_CHAT);
  const [activeTab, setActiveTab] = useState<'messages' | 'settings' | 'profile' | 'templates'>('messages');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (initialChat) {
      setChat(prev => ({ ...prev, ...initialChat }));
    }
  }, [initialChat]);

  const MEME_TEMPLATES: { name: string; platform: Platform; messages: ChatMessage[] }[] = [
    {
      name: 'Breakup',
      platform: 'imessage',
      messages: [
        { id: '1', text: 'We need to talk...', sender: 'them', timestamp: '11:00 PM' },
        { id: '2', text: 'About what?', sender: 'me', timestamp: '11:01 PM' },
        { id: '3', text: 'It\'s not you, it\'s me.', sender: 'them', timestamp: '11:02 PM' }
      ]
    },
    {
      name: 'Toxic Argument',
      platform: 'whatsapp',
      messages: [
        { id: '1', text: 'Where were you?', sender: 'them', timestamp: '2:00 AM', status: 'read' },
        { id: '2', text: 'Sleeping.', sender: 'me', timestamp: '2:05 AM', status: 'read' },
        { id: '3', text: 'Then why were you active on Instagram 5 mins ago? 🤡', sender: 'them', timestamp: '2:06 AM', status: 'read' }
      ]
    },
    {
      name: 'Caught Cheating',
      platform: 'messenger',
      messages: [
        { id: '1', text: 'Who is "Pizza Hut" and why are they sending you heart emojis?', sender: 'them', timestamp: '8:00 PM' },
        { id: '2', text: 'They just really love their customers...', sender: 'me', timestamp: '8:01 PM' }
      ]
    }
  ];

  const applyTemplate = (template: typeof MEME_TEMPLATES[0]) => {
    setChat({
      ...chat,
      platform: template.platform,
      messages: template.messages.map(m => ({ ...m, id: Math.random().toString() }))
    });
    setActiveTab('messages');
  };

  const addMessage = (sender: Sender) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: '',
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };
    setChat({ ...chat, messages: [...chat.messages, newMessage] });
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChat({
      ...chat,
      messages: chat.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const deleteMessage = (id: string) => {
    setChat({ ...chat, messages: chat.messages.filter(m => m.id !== id) });
  };

  const handleExport = async () => {
    const element = document.getElementById('chat-preview-container');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `chatfaker-${chat.contactName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('Please login to save your chats!');
      return;
    }

    try {
      const chatData = {
        ...chat,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'chats'), chatData);
      alert('Chat saved successfully!');
      if (onSave) onSave(chat);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save chat.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'wallpaper' | { type: 'message', id: string }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'photo') {
        setChat({ ...chat, contactPhoto: result });
      } else if (type === 'wallpaper') {
        setChat({ ...chat, settings: { ...chat.settings, wallpaper: result } });
      } else if (typeof type === 'object' && type.type === 'message') {
        updateMessage(type.id, { image: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSetting = (key: keyof typeof chat.settings) => {
    setChat({
      ...chat,
      settings: {
        ...chat.settings,
        [key]: !chat.settings[key]
      }
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    setChat({
      ...chat,
      messages: chat.messages.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          if (reactions.includes(emoji)) {
            return { ...m, reactions: reactions.filter(r => r !== emoji) };
          } else {
            return { ...m, reactions: [...reactions, emoji] };
          }
        }
        return m;
      })
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Controls Panel */}
      <div className="flex-1 space-y-6 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chat Builder
          </h2>
          <div className="flex gap-2">
            <button onClick={handleSave} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
              <Save size={20} className="text-blue-600" />
            </button>
            <button onClick={handleExport} disabled={isExporting} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              <Download size={20} className="text-green-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
          {(['messages', 'profile', 'settings', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all capitalize",
                activeTab === tab ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 gap-4">
              {MEME_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-transparent hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{t.platform}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {t.messages.map(m => m.text).join(' • ')}
                  </p>
                </button>
              ))}
            </div>
          )}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button onClick={() => addMessage('them')} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Plus size={18} /> Add Received
                </button>
                <button onClick={() => addMessage('me')} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus size={18} /> Add Sent
                </button>
              </div>

              <Reorder.Group axis="y" values={chat.messages} onReorder={(newMessages) => setChat({ ...chat, messages: newMessages })} className="space-y-3">
                {chat.messages.map((msg) => (
                  <Reorder.Item key={msg.id} value={msg} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl group">
                    <GripVertical size={18} className="text-gray-400 cursor-grab" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", msg.sender === 'me' ? "text-blue-500" : "text-gray-500")}>
                          {msg.sender === 'me' ? 'Sent' : 'Received'}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors">
                            <ImageIcon size={14} />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, { type: 'message', id: msg.id })}
                            />
                          </label>
                          <input
                            type="text"
                            value={msg.timestamp}
                            onChange={(e) => updateMessage(msg.id, { timestamp: e.target.value })}
                            className="text-[10px] bg-transparent border-none focus:ring-0 text-gray-400 w-16 text-right"
                          />
                          <button onClick={() => deleteMessage(msg.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1">
                          {msg.reactions.map((r, i) => (
                            <span key={i} className="text-xs bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                      {msg.image && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden group/img">
                          <img src={msg.image} alt="message attachment" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateMessage(msg.id, { image: undefined })}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} className="text-white" />
                          </button>
                        </div>
                      )}
                      <textarea
                        value={msg.text}
                        onChange={(e) => updateMessage(msg.id, { text: e.target.value })}
                        placeholder="Message text..."
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 p-2 resize-none"
                        rows={2}
                      />
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['whatsapp', 'imessage', 'messenger', 'instagram'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChat({ ...chat, platform: p })}
                      className={cn(
                        "py-3 rounded-2xl text-xs font-bold capitalize border-2 transition-all",
                        chat.platform === p ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                      {chat.contactPhoto ? (
                        <img src={chat.contactPhoto} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <ImageIcon size={16} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Name</label>
                    <input
                      type="text"
                      value={chat.contactName}
                      onChange={(e) => setChat({ ...chat, contactName: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Photo URL</label>
                  <input
                    type="text"
                    value={chat.contactPhoto || ''}
                    onChange={(e) => setChat({ ...chat, contactPhoto: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</label>
                  <input
                    type="text"
                    value={chat.settings.time}
                    onChange={(e) => setChat({ ...chat, settings: { ...chat.settings, time: e.target.value } })}
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Battery %</label>
                  <input
                    type="number"
                    value={chat.settings.battery ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setChat({ ...chat, settings: { ...chat.settings, battery: isNaN(val) ? 0 : val } });
                    }}
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Seen</label>
                  <input
                    type="text"
                    value={chat.settings.lastSeen || ''}
                    onChange={(e) => setChat({ ...chat, settings: { ...chat.settings, lastSeen: e.target.value } })}
                    placeholder="today at 10:00 AM"
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Background Wallpaper</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chat.settings.wallpaper || ''}
                      onChange={(e) => setChat({ ...chat, settings: { ...chat.settings, wallpaper: e.target.value } })}
                      placeholder="Wallpaper URL..."
                      className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                    <label className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <ImageIcon size={18} className="text-gray-500" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'wallpaper')} />
                    </label>
                  </div>
                </div>

                {[
                  { label: 'Show Online Status', key: 'showOnline' },
                  { label: 'Show Last Seen', key: 'showLastSeen' },
                  { label: 'Show Typing Indicator', key: 'showTyping' },
                  { label: 'WiFi Enabled', key: 'wifi' },
                  { label: 'Verified Badge', key: 'verified' }
                ].map((s) => (
                  <div 
                    key={s.key} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleSetting(s.key as keyof typeof chat.settings)}
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        chat.settings[s.key as keyof typeof chat.settings] ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        chat.settings[s.key as keyof typeof chat.settings] ? "left-7" : "left-1"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:w-[450px] flex flex-col items-center gap-6">
        <div className="sticky top-8 space-y-6 flex flex-col items-center w-full">
          <div id="chat-preview-container" className="p-4 bg-gray-100 dark:bg-gray-800 rounded-[4rem] shadow-inner">
            <ChatPreview chat={chat} onReact={handleReact} />
          </div>
          
          <div className="w-full bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-4">
             <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Smartphone size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Pro Tip</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Use the <b>Export</b> button to download your chat as a high-quality PNG. Perfect for memes and sharing!
            </p>
            <div className="pt-4 border-t dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs text-gray-400">Watermark: {auth.currentUser ? 'Off' : 'On'}</span>
              {!auth.currentUser && (
                <button className="text-xs font-bold text-blue-600 hover:underline">Remove Watermark</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
