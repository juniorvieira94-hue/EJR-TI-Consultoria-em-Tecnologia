
import React from 'react';
import { SERVICES_LIST, LOGO_URL } from '../constants';
import { Network, ShieldCheck, Headset, Cloud, ExternalLink } from 'lucide-react';

interface ServiceSidebarProps {
  onServiceClick: (serviceTitle: string) => void;
  className?: string;
}

const IconMap: Record<string, React.FC<any>> = {
  Network,
  ShieldCheck,
  Headset,
  Cloud
};

export const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ onServiceClick, className = "" }) => {
  return (
    <div className={`bg-slate-900 text-white flex flex-col h-full ${className}`}>
      <div className="p-6 border-b border-slate-800 flex flex-col items-center">
        <img 
          src={LOGO_URL} 
          alt="EJR TI Consultoria" 
          className="w-full max-w-[180px] h-auto mb-2 object-contain"
        />
        <div className="w-full text-center">
          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Agente de IA</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Soluções Corporativas</h2>
          <div className="space-y-3">
            {SERVICES_LIST.map((service) => {
              const Icon = IconMap[service.icon] || Network;
              return (
                <button
                  key={service.id}
                  onClick={() => onServiceClick(service.title)}
                  className="w-full text-left group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-3 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-blue-600/20 text-blue-400 group-hover:text-blue-300 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-white">{service.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 pl-1 leading-relaxed">
                    {service.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 px-2">
           <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-4 shadow-xl border border-blue-600/30">
             <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               Falar com Consultor <ExternalLink size={14} />
             </h3>
             <p className="text-[11px] text-blue-100 mb-4">
               Para orçamentos, projetos ou suporte técnico emergencial.
             </p>
             <a 
                href="https://wa.me/558541018450"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 bg-white text-blue-900 text-center text-xs font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md active:scale-95"
             >
               Abrir WhatsApp
             </a>
           </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center">
        EJR TI - Consultoria e Estratégia<br/>
        © {new Date().getFullYear()}
      </div>
    </div>
  );
};
