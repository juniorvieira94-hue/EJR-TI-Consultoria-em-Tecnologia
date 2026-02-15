
import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";
import { getChatInstance, resetChat } from './services/geminiService';
import { ChatMessage, Role } from './types';
import { ChatBubble } from './components/ChatBubble';
import { ServiceSidebar } from './components/ServiceSidebar';
import { WHATSAPP_LINK } from './constants';

function App() {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Seja bem-vindo à EJR TI! 🚀 \n\nSou seu consultor virtual especialista em soluções tecnológicas para empresas. \n\nPosso te ajudar a qualificar sua infraestrutura, tirar dúvidas sobre o Microsoft 365 ou proteger os dados da sua empresa. \n\nComo posso tornar sua TI mais estratégica hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = getChatInstance();
      const resultStream = await chat.sendMessageStream({ message: textToSend });
      
      let fullResponseText = "";
      const botMsgId = (Date.now() + 1).toString();

      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          role: Role.MODEL,
          text: "", 
          timestamp: new Date()
        }
      ]);

      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponseText += chunkText;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, text: fullResponseText } 
                : msg
            )
          );
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "Houve um pequeno erro na conexão. Se for urgente, você pode nos chamar direto no WhatsApp pelo link: " + WHATSAPP_LINK,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceClick = (serviceTitle: string) => {
    const prompt = `Gostaria de saber como a EJR TI trabalha com ${serviceTitle}. Poderia me dar mais detalhes?`;
    handleSendMessage(prompt);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative z-30 w-72 h-full transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <ServiceSidebar onServiceClick={handleServiceClick} />
      </aside>

      <main className="flex-1 flex flex-col h-full w-full relative">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 leading-tight">EJR TI Virtual</span>
                <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Pronto para Atendimento
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors border border-green-200"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <button 
               onClick={() => {
                  resetChat();
                  setMessages([{
                    id: Date.now().toString(),
                    role: Role.MODEL,
                    text: "Como podemos impulsionar os resultados da sua empresa através da tecnologia agora?",
                    timestamp: new Date()
                  }]);
               }}
               className="text-xs font-semibold text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar bg-slate-50"
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && messages[messages.length - 1].role === Role.USER && (
               <div className="flex w-full mb-6 justify-start animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 border border-white shadow-sm">
                     <Sparkles size={16} />
                   </div>
                   <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 ml-2 italic">Consultando base técnica...</span>
                   </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Dúvida sobre Office 365, Redes ou Segurança? Pergunte aqui..."
                className="w-full pl-4 pr-4 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl resize-none text-slate-800 placeholder:text-slate-400 text-sm md:text-base transition-all max-h-40 min-h-[56px] custom-scrollbar shadow-inner"
                rows={1}
                style={{ height: 'auto', minHeight: '56px' }}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl shadow-xl hover:shadow-blue-500/40 transition-all duration-200 flex items-center justify-center transform active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </div>
          <div className="max-w-3xl mx-auto flex justify-between items-center mt-3 px-1">
            <p className="text-[10px] text-slate-400 font-medium italic">
              EJR TI - Expertise em Tecnologia para PMEs
            </p>
            <div className="flex gap-4">
               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                 Office 365
               </span>
               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                 Cloud Computing
               </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
