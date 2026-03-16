
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIChatAssistant: React.FC<{ lang: Language }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = {
    BG: { placeholder: 'Задайте въпрос...', title: 'Асистент за прием', welcome: 'Здравейте! Аз съм вашият ИИ асистент. Как мога да ви помогна с приема или информация за университета?', error: 'Грешка при свързване. Моля, опитайте по-късно.' },
    RU: { placeholder: 'Задайте вопрос...', title: 'Ассистент по приему', welcome: 'Здравствуйте! Я ваш ИИ-ассистент. Как я могу помочь вам с поступлением или информацией об университете?', error: 'Ошибка соединения. Пожалуйста, попробуйте позже.' },
    RO: { placeholder: 'Pune o întrebare...', title: 'Asistent admitere', welcome: 'Bună ziua! Sunt asistentul tău AI. Cum te pot ajuta cu admiterea sau informații despre universitate?', error: 'Eroare de conexiune. Vă rugăm să încercați mai târziu.' },
    EN: { placeholder: 'Ask a question...', title: 'Admission Assistant', welcome: 'Hello! I am your AI assistant. How can I help you with admission or university information?', error: 'Connection error. Please try again later.' }
  }[lang];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: t.welcome }]);
    }
  }, [lang, t.welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Initialize the GoogleGenAI client correctly with the API key from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Gemini API history must start with a 'user' message. 
      // We skip the initial model-generated welcome message to ensure a valid sequence.
      const chatHistory = updatedMessages
        .filter((m, i) => !(i === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Use ai.models.generateContent directly as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatHistory,
        config: {
          systemInstruction: `You are an official academic assistant for the Taraclia Branch of Angel Kanchev University of Ruse. 
          Context: 
          - State University of Bulgaria in Moldova.
          - Provides European diplomas recognized in EU.
          - Admission 2025 is active. 
          - Location: Taraclia, Moldova.
          Be professional, polite, and academic. Answer in ${lang}.`,
          temperature: 0.7,
        }
      });

      // Correctly extract text output using the .text property (not a method)
      const aiText = response.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: (t as any).error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[500] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white w-[350px] md:w-[400px] h-[500px] shadow-2xl border border-slate-200 flex flex-col rounded-2xl overflow-hidden mb-4"
          >
            <div className="bg-[#003366] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFCC00] p-1.5 rounded-lg">
                  <Bot size={16} className="text-[#003366]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.title}</span>
                  <span className="text-[8px] text-[#FFCC00] font-bold uppercase tracking-tighter">Powered by Gemini</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${m.role === 'user' ? 'bg-[#FFCC00] text-[#003366]' : 'bg-[#003366] text-white'}`}>
                      {m.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-[#003366] text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="flex-grow text-sm border-none focus:ring-0 placeholder:text-slate-300 bg-slate-50 rounded-xl px-4 py-2"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-[#003366] text-white p-2 rounded-xl hover:bg-[#FFCC00] hover:text-[#003366] transition-all disabled:opacity-30 disabled:grayscale"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#001a33] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#FFCC00] hover:text-[#003366] transition-all group active:scale-95 border border-white/10 relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFCC00] rounded-full border-2 border-[#001a33] animate-pulse"></div>
        )}
      </motion.button>
    </div>
  );
};
