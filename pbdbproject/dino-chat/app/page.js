// app/page.js

'use client';

import { useState } from 'react';
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  MapIcon,
  PhotoIcon,
  BookmarkSquareIcon,
  SparklesIcon,
  AcademicCapIcon,
  BeakerIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { ChatMessage } from '@/components/ChatMessage';
import ImageLightbox from '@/components/ImageLightbox';
import { DiscoverDashboard } from '@/components/DiscoverDashboard';


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('auto');
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageSearchMessage, setImageSearchMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeNav, setActiveNav] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          mode: mode === 'auto' ? null : mode
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiMessage = {
        role: 'assistant',
        content: data.response,
        mode: data.mode,
        detectedDinosaur: data.detectedDinosaur,
        paleoData: data.paleoData
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const searchImages = async (e) => {
    e.preventDefault();
    if (!imageQuery.trim()) return;

    setImageSearchLoading(true);
    setImageSearchMessage('Searching for images...');

    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dinosaurName: imageQuery })
      });

      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();
      const images = data.images || [];
      setImageResults(images);

      if (images.length === 0) {
        setImageSearchMessage('No images found for that dinosaur. Try another name.');
      } else {
        setImageSearchMessage(`Showing ${images.length} image${images.length > 1 ? 's' : ''} from Wikimedia Commons`);
      }
    } catch (error) {
      console.error('Image search error:', error);
      setImageResults([]);
      setImageSearchMessage('Could not fetch images right now. Please try again.');
    } finally {
      setImageSearchLoading(false);
    }
  };

  const suggestedQuestions = [
    "Tell me about Tyrannosaurus Rex",
    "What was the biggest dinosaur?",
    "How did dinosaurs go extinct?",
    "What did Velociraptors really look like?"
  ];

  const navigationItems = [
    { id: 'chat', label: 'Chat', description: 'Talk to the paleo expert', icon: ChatBubbleLeftRightIcon },
    { id: 'discover', label: 'Discover', description: 'Browse curated fossil facts', icon: MapIcon },
    { id: 'gallery', label: 'Gallery', description: 'Dive into paleo imagery', icon: PhotoIcon }
  ];
  const activeNavMeta = navigationItems.find((item) => item.id === activeNav) || navigationItems[0];
  const modeOptions = [
    { id: 'auto', label: 'Auto', description: 'Let the assistant decide', icon: SparklesIcon },
    { id: 'educational', label: 'Educational', description: 'Teacher-style responses', icon: AcademicCapIcon },
    { id: 'technical', label: 'Technical', description: 'Deep scientific dives', icon: BeakerIcon }
  ];
  const primaryButtonBase = 'inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-linear-to-r from-slate-700 to-slate-800 text-white font-medium transition-all hover:from-slate-600 hover:to-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/40 disabled:opacity-60 disabled:cursor-not-allowed';
  const tileButtonBase = 'w-full rounded-2xl border px-4 py-3 transition-all shadow-sm';
  const tileButtonActive = 'bg-linear-to-r from-slate-600/70 to-slate-700/70 border-slate-400/50 text-white shadow-lg';
  const tileButtonInactive = 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-slate-400/40 hover:bg-white/10';

  const handleNavChange = (navId) => {
    setActiveNav(navId);
    setSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-72 border-r border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <Image
              src="/images/logo.png"  
              alt="DinoChat Logo"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Paleo AI</h1>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setMessages([])}
          className={`${primaryButtonBase} w-full justify-between px-5 py-4 mb-6`}
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-xl bg-white/10">
              <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">New Chat</span>
            </span>
          </span>
        </button>
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-white/60 text-xs uppercase tracking-widest">
            <span>Navigation</span>
          </div>
          <div className="space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavChange(item.id)}
                  className={`${tileButtonBase} flex items-center gap-3 text-left ${
                    isActive ? tileButtonActive : tileButtonInactive
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/70'}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-white/60">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-white/60 text-xs uppercase tracking-widest">
            <span>Mode</span>
          </div>
          <div className="space-y-3">
            {modeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id)}
                  className={`${tileButtonBase} flex items-center gap-3 text-left ${
                    isActive ? tileButtonActive : tileButtonInactive
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/70'}`} aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm">{option.label}</p>
                    <p className="text-xs text-white/60">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </aside>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex min-h-screen flex-col transition-[margin] duration-300 lg:ml-72">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">{activeNavMeta.label}</span>
            </button>
            <div className="text-white/60 text-xs uppercase tracking-[0.4em] lg:hidden">
              {activeNavMeta.description}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <button className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-all">
              ⚙️ Settings
            </button> */}
            <button className={`${primaryButtonBase} w-full justify-center px-4 py-2 sm:w-auto`}>
              <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
              <span>Export</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeNav === 'gallery' ? (
            <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white">Dinosaur Image Explorer</h3>
                    <p className="text-white/60 text-sm">
                      Search Wikimedia Commons for paleo imagery right from this tab.
                    </p>
                  </div>
                  <form onSubmit={searchImages} className="flex w-full flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={imageQuery}
                      onChange={(e) => setImageQuery(e.target.value)}
                      placeholder="e.g. Triceratops"
                      className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-slate-400"
                      disabled={imageSearchLoading}
                    />
                    <button
                      type="submit"
                      disabled={imageSearchLoading || !imageQuery.trim()}
                      className={`${primaryButtonBase} px-6 py-3`}
                    >
                      {imageSearchLoading ? 'Searching...' : 'Search images'}
                    </button>
                  </form>
                </div>

                {imageSearchMessage && (
                  <p className="text-sm text-white/60 mt-3">{imageSearchMessage}</p>
                )}

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  

                  {imageResults.map((image, idx) => (
                    <button
                      key={`${image.url}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-400/60 rounded-2xl overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-slate-400/70"
                    >
                      <div className="aspect-video bg-black/30">
                        <Image
                          width={400}
                          height={225}
                          src={image.url}
                          alt={image.title || "Dinosaur image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="py-2 px-4">
                        <p className="text-white/60 text-xs mt-1">
                          {image.source || "Wikimedia Commons"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedImage && (
                <ImageLightbox
                  image={selectedImage}
                  onClose={() => setSelectedImage(null)}
                />
              )}
              </div>
            </section>
          ) : activeNav === 'chat' ? (
            <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {messages.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center">
                  <div className="mb-8 relative">
                    <div className="w-24 h-24 mx-auto relative">
                      <div className="relative w-24 h-24 bg-radial-[at_25%_25%] from-slate-900 to-slate-900 to-75% rounded-full flex items-center justify-center shadow-xl">
                        <Image
                            src="/images/logo-trans.png"  
                            alt="DinoChat Logo"
                            width={60}
                            height={60}
                            className="object-cover rounded-full"
                          />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold text-white mb-4">
                    Ready to Explore The Prehistoric World?
                  </h2>
                  <p className="text-white/60 text-lg mb-4">
                    Ask me anything about dinosaurs and prehistoric life
                  </p>

                  <div className="flex justify-center gap-4 mb-12">
                    <a
                      href="https://paleobiodb.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 text-sm underline text-slate-400">
                      <span className="flex items-center gap-1">
                        Powered by the Paleobiology Database
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto sm:grid-cols-2">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(question)}
                        className={`${tileButtonBase} ${tileButtonInactive} text-left`}
                      >
                        <span className="text-sm text-white">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg} />
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-white/60">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
            <DiscoverDashboard />
          )}
        </div>

        {activeNav === 'chat' && (
          <div className="sticky bottom-0 z-50 border-t border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:p-6">
            <form onSubmit={sendMessage} className="mx-auto max-w-4xl">
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder="Ask anything about dinosaurs..."
                    className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none resize-none px-4 py-3"
                    rows="1"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`${primaryButtonBase} p-3`}
                  >
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
