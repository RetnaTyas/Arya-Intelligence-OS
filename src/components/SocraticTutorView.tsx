import React, { useState } from 'react';
import { Send, Sparkles, Brain, AlertTriangle, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { KnowledgeNode, LearnerNodeState } from '../types';

interface SocraticTutorViewProps {
  activeNode: KnowledgeNode;
  learnerState?: LearnerNodeState;
  onEvidenceGenerated: (conceptName: string, studentQuery: string, tutorReply: string) => void;
}

interface Message {
  id: string;
  role: 'student' | 'tutor';
  text: string;
  detectedMisconception?: string;
  timestamp: string;
}

export const SocraticTutorView: React.FC<SocraticTutorViewProps> = ({
  activeNode,
  learnerState,
  onEvidenceGenerated,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      role: 'tutor',
      text: `Halo Arya! Kita sedang berada di node "${activeNode.name}". Di Intelligence OS, kita tidak menghafal rumus secara buta. Mari kita mulai dari pertanyaan "KENAPA": apa yang paling membuatmu penasaran tentang fenomena ini?`,
      timestamp: '17:40',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModelSource, setActiveModelSource] = useState<string>('');

  const samplePrompts = [
    'Kenapa kapal induk baja 100.000 ton bisa mengapung sedangkan paku kecil tenggelam?',
    'Kenapa aturan aljabar tidak memperbolehkan kita membagi dengan nol?',
    'Bagaimana kapal selam bisa melayang netral di tengah laut tanpa terus-terusan mengayuh baling-baling?',
    'Kenapa kita melakukan operasi yang sama pada kedua sisi neraca?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const studentMsg: Message = {
      id: `std-${Date.now()}`,
      role: 'student',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeNode.name,
          studentMessage: query,
          history: messages.slice(-4),
          learnerState,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      if (data.source) {
        setActiveModelSource(data.source);
      }
      const tutorMsg: Message = {
        id: `tut-${Date.now()}`,
        role: 'tutor',
        text: data.text,
        detectedMisconception: data.detectedMisconception,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
      onEvidenceGenerated(activeNode.name, query, data.text);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'tutor',
          text: `[Cloudflare Workers AI Error]: ${e.message}. Pastikan binding Pages "AiOS AI" atau kredensial CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_API_TOKEN telah terhubung.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="socratic-tutor-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> Tutor Socratic & Feynman Sensor
            </span>
            {activeModelSource && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Engine: {activeModelSource}</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white tracking-wide mt-1">
            Eksplorasi Dialog Sebab-Akibat ({activeNode.name})
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Aturan Sistem: <em>Tutor tidak pernah sekadar menyuapi jawaban rumus. Tutor membimbingmu menurunkan prinsip dari eksperimen pikiran dan penalaran mandiri.</em>
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Fokus: <strong className="text-indigo-300 font-semibold">{activeNode.domain}</strong>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="bg-[#0c101c] border border-slate-800 rounded-xl p-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.role === 'student' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mb-1">
              <span>{msg.role === 'student' ? 'Arya (Learner)' : 'AI Socratic Tutor'}</span>
              <span>·</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed shadow ${
                msg.role === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>

            {msg.detectedMisconception && (
              <div className="mt-1.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-200 flex items-start gap-1.5 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Feynman Sensor Alert:</strong> Terdeteksi miskonsepsi: <em>"{msg.detectedMisconception}"</em>. Tutor mengarahkan counter-example.
                </span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="self-start flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>AI Socratic Tutor sedang merumuskan pertanyaan penyelidikan...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
          Pertanyaan Pemantik Rasa Ingin Tahu (Voluntary Engagement):
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="text-left text-[11px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-lg text-slate-300 transition"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          id="socratic-chat-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ajukan hipotesis, analogi, atau pertanyaan 'kenapa' kepada Tutor Socratic..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          id="send-socratic-chat-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>
      </div>
    </div>
  );
};
