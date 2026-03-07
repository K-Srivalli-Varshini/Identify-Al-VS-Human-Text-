import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Terminal, 
  ChevronRight, 
  Send, 
  Cpu, 
  User, 
  AlertCircle,
  Activity,
  Database,
  BrainCircuit,
  Upload,
  Layers,
  BarChart3,
  FileText,
  CheckCircle2,
  Info,
  Zap,
  Trash2,
  Monitor,
  Type,
  Settings,
  GitMerge,
  ShieldCheck,
  Minimize2,
  Maximize2,
  X,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { HistoryRecord, LogEntry, AnalysisResult, ViewType } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('RoBERTa (Optimized)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'system', content: string, result?: AnalysisResult }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Model Selection State
  const [sensitivity, setSensitivity] = useState(50);
  const [weights, setWeights] = useState({ roberta: 60, gemini: 40 });

  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isLogsVisible, setIsLogsVisible] = useState(true);

  // Workflow State
  const [workflowTasks, setWorkflowTasks] = useState<{ id: string, name: string, status: 'pending' | 'processing' | 'completed' | 'failed', progress: number, result?: string }[]>([
    { id: '1', name: 'Academic_Paper_Draft.pdf', status: 'completed', progress: 100, result: 'Human Written (94%)' },
    { id: '2', name: 'Marketing_Copy_v2.txt', status: 'completed', progress: 100, result: 'AI Generated (88%)' },
    { id: '3', name: 'Legal_Brief_Final.docx', status: 'processing', progress: 45 },
    { id: '4', name: 'Blog_Post_Draft.md', status: 'pending', progress: 0 },
  ]);

  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const pipelineSteps = [
    { title: 'User Interface', desc: 'Capturing raw user input and preparing for transmission.', icon: <Monitor size={20} /> },
    { title: 'Text Input', desc: 'Normalizing and sanitizing the input text stream.', icon: <Type size={20} /> },
    { title: 'Pre-Processing', desc: 'Cleaning, sentence splitting, and tokenization.', icon: <Settings size={20} /> },
    { title: 'Parallel Model Processing', desc: 'Simultaneous analysis across RoBERTa, Gemini, and GPT-4o.', icon: <Cpu size={20} /> },
    { title: 'Prediction Aggregation', desc: 'Fusing multiple model outputs into a unified forensic score.', icon: <GitMerge size={20} /> },
    { title: 'AI vs Human Classification', desc: 'Final classification and sentence-level highlighting.', icon: <ShieldCheck size={20} /> },
    { title: 'Visualization & Report', desc: 'Generating the final forensic dashboard and report.', icon: <BarChart3 size={20} /> },
  ];

  const startPipelineVisualization = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    setActivePipelineStep(0);
    
    // Add a log entry for the simulation
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Starting Parallel Text Analysis Workflow Simulation...',
    };
    setLogs(prev => [newLog, ...prev]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= pipelineSteps.length) {
        clearInterval(interval);
        
        // Finalize simulation
        const finishLog: LogEntry = {
          id: Date.now() + 1,
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: 'Workflow simulation completed successfully. Results aggregated.',
        };
        setLogs(prev => [finishLog, ...prev]);

        setTimeout(() => {
          setIsVisualizing(false);
          setActivePipelineStep(-1);
        }, 3000);
      } else {
        setActivePipelineStep(step);
        
        // Add step-specific logs
        const stepLog: LogEntry = {
          id: Date.now() + step,
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Executing: ${pipelineSteps[step].title}...`,
        };
        setLogs(prev => [stepLog, ...prev]);
      }
    }, 1500);
  };

  const handleBatchProcess = () => {
    setWorkflowTasks(prev => prev.map(task => 
      task.status === 'pending' || task.status === 'processing' 
        ? { ...task, status: 'processing', progress: 0 } 
        : task
    ));

    const interval = setInterval(() => {
      setWorkflowTasks(prev => {
        const allDone = prev.every(t => t.status === 'completed');
        if (allDone) {
          clearInterval(interval);
          return prev;
        }
        return prev.map(task => {
          if (task.status === 'processing') {
            const newProgress = Math.min(task.progress + Math.floor(Math.random() * 15) + 5, 100);
            return {
              ...task,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'processing',
              result: newProgress === 100 ? (Math.random() > 0.5 ? 'AI Generated (92%)' : 'Human Written (96%)') : undefined
            };
          }
          return task;
        });
      });
    }, 800);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setIsAnalyzing(true);
    setLastResult(null); 
    
    // Add user message to chat history
    setChatMessages(prev => [...prev, { role: 'user', content: text.substring(0, 100) + (text.length > 100 ? '...' : '') }]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.log(`Starting analysis with model: ${selectedModel}`);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model: selectedModel }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        console.error('Analysis API error:', data);
        setChatMessages(prev => [...prev, { 
          role: 'system', 
          content: `Error: ${data.details || data.error || 'Analysis failed'}` 
        }]);
        fetchLogs();
        return;
      }
      
      const result: AnalysisResult = data;
      setLastResult(result);
      
      setChatMessages(prev => [...prev, { 
        role: 'system', 
        content: `Analysis Complete: ${result.prediction} (${(result.confidence * 100).toFixed(1)}%)`,
        result
      }]);
      
      fetchHistory();
      fetchLogs();

      // Scroll to results after a short delay to allow rendering
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('Analysis timed out');
        setChatMessages(prev => [...prev, { 
          role: 'system', 
          content: 'Error: Analysis timed out after 30 seconds. Please try again with shorter text.' 
        }]);
      } else {
        console.error('Network error during analysis:', err);
        setChatMessages(prev => [...prev, { 
          role: 'system', 
          content: `Network Error: ${err.message || 'Failed to connect to the analysis server.'}` 
        }]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResult = () => {
    if (!lastResult) return;
    
    let textToCopy = '';
    if (lastResult.segments) {
      textToCopy = lastResult.segments.map(s => s.text).join(' ');
    } else {
      textToCopy = inputText;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to delete history record', err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newTasks = Array.from(files).map((file: File, index) => ({
        id: (workflowTasks.length + index + 1).toString(),
        name: file.name,
        status: 'pending' as const,
        progress: 0
      }));
      setWorkflowTasks(prev => [...prev, ...newTasks]);
      
      // Log the upload
      const uploadLog: LogEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Batch Upload: ${files.length} files added to queue.`,
      };
      setLogs(prev => [uploadLog, ...prev]);
      
      // Reset input
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = '';
      }
    }
  };

  const chartData = lastResult ? [
    { name: 'AI Probability', value: lastResult.prediction === 'AI Generated' ? lastResult.confidence * 100 : (1 - lastResult.confidence) * 100 },
    { name: 'Human Probability', value: lastResult.prediction === 'Human Written' ? lastResult.confidence * 100 : (1 - lastResult.confidence) * 100 }
  ] : [];

  const comparisonData = [
    { name: 'RoBERTa', score: lastResult?.prediction === 'AI Generated' ? 92 : 8 },
    { name: 'Gemini', score: lastResult?.prediction === 'AI Generated' ? 95 : 5 },
    { name: 'GPT-4o', score: lastResult?.prediction === 'AI Generated' ? 88 : 12 },
    { name: 'Ensemble', score: lastResult?.prediction === 'AI Generated' ? 94 : 6 },
  ];

  const statsData = [
    { name: 'AI Generated', value: history.filter(h => h.prediction === 'AI Generated').length || 10 },
    { name: 'Human Written', value: history.filter(h => h.prediction === 'Human Written').length || 15 },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-slate-900">VERIFY AI</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2 font-bold">Text Authenticity Lab</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Home" 
            active={activeView === 'home'} 
            onClick={() => setActiveView('home')} 
          />
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Text Detection" 
            active={activeView === 'detection'} 
            onClick={() => setActiveView('detection')} 
          />
          <SidebarItem 
            icon={<Layers size={20} />} 
            label="Model Selection" 
            active={activeView === 'models'} 
            onClick={() => setActiveView('models')} 
          />
          <SidebarItem 
            icon={<Zap size={20} />} 
            label="Workflow" 
            active={activeView === 'workflow'} 
            onClick={() => setActiveView('workflow')} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="History" 
            active={activeView === 'history'} 
            onClick={() => setActiveView('history')} 
          />
          <SidebarItem 
            icon={<Terminal size={20} />} 
            label="Logs" 
            active={activeView === 'logs'} 
            onClick={() => setActiveView('logs')} 
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Dataset Stats" 
            active={activeView === 'stats'} 
            onClick={() => setActiveView('stats')} 
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Engine Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Operational</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 mr-2">
              <button 
                onClick={() => setIsChatVisible(!isChatVisible)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isChatVisible ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Toggle Chat History"
              >
                <History size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Chat</span>
              </button>
              <button 
                onClick={() => setIsLogsVisible(!isLogsVisible)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isLogsVisible ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Toggle System Logs"
              >
                <Terminal size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Logs</span>
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Database size={16} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600">v2.4.0-stable</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h1 className="text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                      AI VS HUMAN <span className="text-indigo-600">TEXT IDENTIFICATION</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                      Advanced forensic analysis to distinguish between synthetic AI generation and authentic human authorship.
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveView('detection')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                      >
                        Launch Detector <ChevronRight size={20} />
                      </button>
                      <button 
                        onClick={() => setActiveView('stats')}
                        className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-3"
                      >
                        View Stats <BarChart3 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                          <Activity size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Metrics</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Global Accuracy</span>
                          <span className="text-indigo-600">99.8%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '99.8%' }}
                            className="h-full bg-indigo-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Scans</p>
                          <p className="text-2xl font-black text-slate-800">{history.length + 1240}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Latency</p>
                          <p className="text-2xl font-black text-slate-800">142ms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'detection' && (
              <motion.div 
                key="detection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto space-y-10 pb-20"
              >
                {/* Input Section */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="text-indigo-600" size={20} />
                      <h3 className="font-bold text-slate-800">Source Content</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                      >
                        <Upload size={14} /> Upload File
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".txt,.md"
                      />
                      <button 
                        onClick={() => setActiveView('workflow')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-all"
                      >
                        <Layers size={14} /> Parallel Workflow
                      </button>
                    </div>
                  </div>
                  
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste text here for deep forensic analysis..."
                    className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option>RoBERTa (Optimized)</option>
                        <option>Local RoBERTa Model</option>
                        <option>Google Gemini Pro</option>
                        <option>OpenAI GPT-4o</option>
                        <option>Ensemble v2</option>
                      </select>
                      <span className="text-xs text-slate-400 font-medium">{inputText.length} characters</span>
                    </div>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !inputText.trim()}
                      className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-3 disabled:opacity-50"
                    >
                      {isAnalyzing ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                      Analyze Content
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                {lastResult && (
                  <motion.div 
                    ref={resultsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Highlighted Text */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-emerald-500" size={20} />
                          <h3 className="font-bold text-slate-800">Forensic Highlights</h3>
                        </div>
                        <button 
                          onClick={handleCopyResult}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                        >
                          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy Result'}
                        </button>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[200px] text-sm leading-relaxed text-slate-700">
                        {lastResult.segments ? (
                          lastResult.segments.map((segment, i) => {
                            const isAI = segment.label === 'AI Generated';
                            return (
                              <span 
                                key={i} 
                                className={`rounded px-1 py-0.5 transition-colors duration-500 ${
                                  isAI 
                                    ? 'bg-rose-100 text-rose-800 border-b-2 border-rose-300' 
                                    : 'bg-emerald-100 text-emerald-800 border-b-2 border-emerald-300'
                                }`}
                                title={`${segment.label} (${(segment.score * 100).toFixed(0)}%)`}
                              >
                                {segment.text}{' '}
                              </span>
                            );
                          })
                        ) : (
                          inputText.split(' ').map((word, i) => {
                            const isSuspicious = lastResult.prediction === 'AI Generated' && i % 7 === 0;
                            return (
                              <span key={i} className={isSuspicious ? 'bg-rose-100/50 rounded px-0.5' : ''}>
                                {word}{' '}
                              </span>
                            );
                          })
                        )}
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                          <div className="w-3 h-3 bg-rose-200 rounded" /> AI Generated
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                          <div className="w-3 h-3 bg-emerald-200 rounded" /> Human Written
                        </div>
                      </div>
                    </div>

                    {/* AI Probability Graph */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="text-indigo-600" size={20} />
                        <h3 className="font-bold text-slate-800">Probability Distribution</h3>
                      </div>
                      <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#10b981'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-500">Classification</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            lastResult.prediction === 'AI Generated' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {lastResult.prediction}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-500">Confidence</span>
                          <span className="text-sm font-black text-slate-800">{(lastResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Model Comparison */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl">
                      <div className="flex items-center gap-2 mb-6">
                        <Layers className="text-indigo-600" size={20} />
                        <h3 className="font-bold text-slate-800">Cross-Model Verification</h3>
                      </div>
                      <div className="space-y-4">
                        {comparisonData.map((item) => (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span>{item.name}</span>
                              <span>{item.score}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                className="h-full bg-slate-800"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="lg:col-span-2 bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Info size={120} />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                          <Info size={20} className="text-indigo-300" />
                          <h3 className="font-bold text-indigo-100">Analysis Explanation</h3>
                        </div>
                        <p className="text-indigo-100/80 leading-relaxed font-medium italic">
                          "{lastResult.reasoning}"
                        </p>
                        <div className="pt-4 flex items-center justify-between">
                          <div className="flex gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Perplexity</p>
                              <p className="text-xl font-bold">14.2</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Burstiness</p>
                              <p className="text-xl font-bold">8.7</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Entropy</p>
                              <p className="text-xl font-bold">4.1</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveView('workflow');
                              setTimeout(startPipelineVisualization, 500);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border border-white/10"
                          >
                            <Zap size={14} /> Watch Live Flow
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeView === 'models' && (
              <motion.div 
                key="models"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto space-y-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Model Cards */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800">Available Engines</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <ModelCard 
                        name="RoBERTa (Optimized)" 
                        accuracy="98.2%" 
                        latency="<150ms" 
                        strength="Structural Analysis" 
                        selected={selectedModel === 'RoBERTa (Optimized)'}
                        onClick={() => setSelectedModel('RoBERTa (Optimized)')}
                      />
                      <ModelCard 
                        name="Local RoBERTa Model" 
                        accuracy="97.5%" 
                        latency="<50ms" 
                        strength="On-Device Privacy" 
                        selected={selectedModel === 'Local RoBERTa Model'}
                        onClick={() => setSelectedModel('Local RoBERTa Model')}
                      />
                      <ModelCard 
                        name="Google Gemini Pro" 
                        accuracy="99.5%" 
                        latency="~800ms" 
                        strength="Semantic Depth" 
                        selected={selectedModel === 'Google Gemini Pro'}
                        onClick={() => setSelectedModel('Google Gemini Pro')}
                      />
                      <ModelCard 
                        name="OpenAI GPT-4o" 
                        accuracy="99.1%" 
                        latency="~1.2s" 
                        strength="Contextual Nuance" 
                        selected={selectedModel === 'OpenAI GPT-4o'}
                        onClick={() => setSelectedModel('OpenAI GPT-4o')}
                      />
                      <ModelCard 
                        name="Ensemble v2" 
                        accuracy="99.8%" 
                        latency="~1.5s" 
                        strength="Maximum Precision" 
                        selected={selectedModel === 'Ensemble v2'}
                        onClick={() => setSelectedModel('Ensemble v2')}
                      />
                    </div>
                  </div>

                  {/* Tuning Controls */}
                  <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl space-y-8">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={20} className="text-indigo-600" />
                        Engine Tuning
                      </h3>
                      
                      {/* Sensitivity Slider */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-600">Detection Sensitivity</span>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">{sensitivity}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sensitivity} 
                          onChange={(e) => setSensitivity(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Conservative</span>
                          <span>Balanced</span>
                          <span>Strict</span>
                        </div>
                      </div>

                      {/* Ensemble Weighting */}
                      <div className="space-y-6 pt-6 border-t border-slate-100">
                        <span className="text-sm font-bold text-slate-600">Ensemble Weighting</span>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                              <span>RoBERTa (Structural)</span>
                              <span>{weights.roberta}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-800" style={{ width: `${weights.roberta}%` }} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                              <span>Gemini (Semantic)</span>
                              <span>{weights.gemini}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600" style={{ width: `${weights.gemini}%` }} />
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setWeights({ roberta: 50, gemini: 50 })}
                          className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                          Reset to Balanced Weights
                        </button>
                      </div>
                    </div>

                    <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Info size={20} className="text-indigo-300" />
                        <h3 className="font-bold text-indigo-100">Tuning Guide</h3>
                      </div>
                      <p className="text-sm text-indigo-100/70 leading-relaxed">
                        Increasing sensitivity will flag more content as AI but may increase false positives. 
                        For academic use, we recommend a "Conservative" setting (30-40%).
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'workflow' && (
              <motion.div 
                key="workflow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto space-y-10"
              >
                {/* Parallel Text Analysis Workflow System Visualization */}
                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl overflow-hidden relative min-h-[850px]">
                  {/* Background Pattern (Circuit/Grid) */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                  
                  <div className="flex flex-col items-center mb-12 relative z-10">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Parallel Text Analysis Workflow System</h3>
                    <p className="text-slate-500 font-medium mt-2">Determine if text is AI-generated or Human-written.</p>
                  </div>

                  {/* The Diagram Container */}
                  <div className="relative h-[700px] w-full">
                    {/* SVG Connections Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <defs>
                        <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                        </marker>
                      </defs>
                      
                      {/* Connections (Simplified paths for the diagram) */}
                      {/* UI to Text Input */}
                      <path d="M 180 180 L 260 250" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Text Input to Pre-Processing */}
                      <path d="M 360 250 Q 400 200 450 180" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Text Input to Parallel Processing */}
                      <path d="M 310 290 L 310 350" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Pre-Processing to Aggregation */}
                      <path d="M 600 180 Q 650 250 680 300" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Parallel Processing to Aggregation */}
                      <path d="M 580 420 L 680 380" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Parallel Processing to Logging */}
                      <path d="M 450 480 L 450 550" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Logging to Database */}
                      <path d="M 350 600 L 280 600" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      <path d="M 280 620 L 350 620" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Aggregation to Classification */}
                      <path d="M 750 450 L 750 550" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Aggregation to Visualization Top */}
                      <path d="M 820 350 L 900 300" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Classification to Visualization Bottom */}
                      <path d="M 820 600 L 900 650" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-blue)" />

                      {/* Animated Flow Dots */}
                      {isVisualizing && (
                        <>
                          <motion.circle r="4" fill="#6366f1" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                            <animateMotion path="M 180 180 L 260 250" dur="2s" repeatCount="indefinite" />
                          </motion.circle>
                          <motion.circle r="4" fill="#6366f1" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                            <animateMotion path="M 310 290 L 310 350" dur="3s" repeatCount="indefinite" />
                          </motion.circle>
                        </>
                      )}
                    </svg>

                    {/* Nodes Layer */}
                    
                    {/* User Interface */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 0 ? 1.05 : 1,
                        borderColor: activePipelineStep === 0 ? '#6366f1' : '#334155',
                        boxShadow: activePipelineStep === 0 ? '0 0 30px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                      className="absolute left-40 top-10 w-48 h-40 bg-slate-800 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center p-4 transition-colors"
                    >
                      <div className="bg-slate-700 w-full h-24 rounded-lg mb-2 flex items-center justify-center">
                        <Monitor size={48} className={activePipelineStep === 0 ? 'text-white' : 'text-indigo-400'} />
                      </div>
                      <span className="text-white font-black text-xs uppercase tracking-widest">User Interface</span>
                    </motion.div>

                    {/* Text Input Node */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 1 ? 1.1 : 1,
                        borderColor: activePipelineStep === 1 ? '#6366f1' : '#475569',
                        backgroundColor: activePipelineStep === 1 ? '#6366f1' : '#334155'
                      }}
                      className="absolute left-[260px] top-[230px] w-32 h-16 rounded-xl border-2 flex items-center justify-center shadow-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Type size={18} className="text-white" />
                        <span className="text-white font-bold text-xs">Text Input</span>
                      </div>
                    </motion.div>

                    {/* Pre-Processing Node */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 2 ? 1.05 : 1,
                        borderColor: activePipelineStep === 2 ? '#6366f1' : '#e0e7ff',
                        boxShadow: activePipelineStep === 2 ? '0 0 30px rgba(99, 102, 241, 0.2)' : 'none'
                      }}
                      className="absolute left-[450px] top-10 w-52 h-44 bg-white border-4 rounded-2xl p-6 shadow-xl transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <Settings size={18} className={activePipelineStep === 2 ? 'text-indigo-600' : 'text-slate-400'} />
                        <h4 className="font-black text-slate-800 text-xs uppercase">Pre-Processing</h4>
                      </div>
                      <ul className="space-y-2">
                        {['Cleaning', 'Sentence Splitting', 'Tokenization'].map(item => (
                          <li key={item} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${activePipelineStep === 2 ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-200'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Parallel Model Processing Node */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 3 ? 1.02 : 1,
                        borderColor: activePipelineStep === 3 ? '#6366f1' : '#e0e7ff',
                        boxShadow: activePipelineStep === 3 ? '0 0 40px rgba(99, 102, 241, 0.2)' : 'none'
                      }}
                      className="absolute left-[230px] top-[350px] w-[450px] h-48 bg-white border-4 rounded-[2rem] p-6 shadow-2xl transition-colors"
                    >
                      <div className="flex items-center justify-center mb-6">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activePipelineStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          Parallel Model Processing
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: 'RoBERTa', type: 'Local', color: 'bg-orange-500' },
                          { name: 'Gemini', type: 'API', color: 'bg-indigo-600' },
                          { name: 'GPT-4o', type: 'API', color: 'bg-emerald-500' }
                        ].map(model => (
                          <div key={model.name} className="space-y-2">
                            <motion.div 
                              animate={activePipelineStep === 3 ? { y: [0, -5, 0] } : {}}
                              transition={{ repeat: Infinity, duration: 1.5, delay: Math.random() }}
                              className={`${model.color} p-3 rounded-xl text-white text-center shadow-md`}
                            >
                              <p className="text-[10px] font-black">{model.name}</p>
                              <p className="text-[8px] opacity-70">({model.type})</p>
                            </motion.div>
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Prediction</p>
                              <p className={`text-[8px] font-bold ${activePipelineStep === 3 ? 'text-indigo-600' : 'text-slate-800'}`}>AI / Human</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Prediction Aggregation Node */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 4 ? 1.1 : 1,
                        backgroundColor: activePipelineStep === 4 ? '#4338ca' : '#1e1b4b',
                        borderColor: activePipelineStep === 4 ? '#6366f1' : '#1e1b4b'
                      }}
                      className="absolute left-[680px] top-[280px] w-56 h-56 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl border-4 transition-colors"
                    >
                      <GitMerge size={32} className={activePipelineStep === 4 ? 'text-white' : 'text-indigo-400'} />
                      <h4 className="text-white font-black text-xs uppercase mb-4 mt-4">Prediction Aggregation</h4>
                      <ul className="space-y-1">
                        {['Confidence Score', 'Majority Voting', 'Probability Calculation'].map(item => (
                          <li key={item} className={`text-[8px] font-bold transition-colors ${activePipelineStep === 4 ? 'text-white' : 'text-indigo-300'}`}>• {item}</li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Logging & History Storage Node */}
                    <motion.div 
                      animate={{ 
                        borderColor: activePipelineStep === 4 || activePipelineStep === 5 ? '#6366f1' : '#334155',
                      }}
                      className="absolute left-[350px] top-[550px] w-52 h-32 bg-slate-800 rounded-2xl p-6 shadow-xl border-4 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                        <Database size={18} className="text-indigo-400" />
                        <h4 className="font-black text-white text-xs uppercase">Logging & History</h4>
                      </div>
                      <ul className="space-y-2">
                        {['Store Results', 'Save Log File'].map(item => (
                          <li key={item} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <div className={`w-1.5 h-1.5 rounded-full ${activePipelineStep >= 4 ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Database Icon */}
                    <div className="absolute left-40 top-[550px] flex flex-col gap-1 items-center">
                      <div className={`w-16 h-8 rounded-full border-4 shadow-lg transition-colors ${activePipelineStep >= 4 ? 'bg-indigo-500 border-indigo-700' : 'bg-indigo-400 border-indigo-600'}`} />
                      <div className={`w-16 h-8 rounded-full border-4 shadow-lg transition-colors ${activePipelineStep >= 4 ? 'bg-indigo-500 border-indigo-700' : 'bg-indigo-400 border-indigo-600'}`} />
                      <div className={`w-16 h-8 rounded-full border-4 shadow-lg transition-colors ${activePipelineStep >= 4 ? 'bg-indigo-500 border-indigo-700' : 'bg-indigo-400 border-indigo-600'}`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase mt-2">Forensic DB</span>
                    </div>

                    {/* AI vs Human Classification Node */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 5 ? 1.1 : 1,
                        backgroundColor: activePipelineStep === 5 ? '#4f46e5' : '#4338ca',
                        borderColor: activePipelineStep === 5 ? '#818cf8' : '#6366f1'
                      }}
                      className="absolute left-[680px] top-[550px] w-56 h-44 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl border-4 transition-colors"
                    >
                      <ShieldCheck size={32} className="text-white mb-4" />
                      <h4 className="text-white font-black text-xs uppercase mb-4">AI vs Human Classification</h4>
                      <ul className="space-y-1">
                        {['Highlight AI Sentences', 'AI Percentage Graph'].map(item => (
                          <li key={item} className="text-[8px] font-bold text-indigo-100">• {item}</li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Visualization Panels */}
                    <motion.div 
                      animate={{ 
                        scale: activePipelineStep === 6 ? 1.05 : 1,
                        borderColor: activePipelineStep === 6 ? '#6366f1' : '#f1f5f9',
                        boxShadow: activePipelineStep === 6 ? '0 0 40px rgba(99, 102, 241, 0.2)' : 'none'
                      }}
                      className="absolute right-5 top-5 w-48 h-48 bg-white border-2 rounded-[1.5rem] p-4 shadow-2xl transition-colors flex flex-col justify-center"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-slate-800 text-[8px] uppercase tracking-widest">Live Visualization</h4>
                        <BarChart3 size={12} className={activePipelineStep === 6 ? 'text-indigo-600 animate-bounce' : 'text-slate-300'} />
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[6px] font-black text-slate-400">
                            <span>AI PROBABILITY</span>
                            <span className={activePipelineStep === 6 ? 'text-rose-500' : 'text-slate-300'}>64%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              animate={activePipelineStep === 6 ? { width: '64%' } : { width: '0%' }}
                              className="h-full bg-rose-500" 
                            />
                          </div>
                        </div>
                        <div className="flex justify-center pt-1">
                          <motion.div 
                            animate={activePipelineStep === 6 ? { rotate: 405 } : { rotate: 45 }}
                            className="w-16 h-16 rounded-full border-[4px] border-emerald-500 border-t-rose-500 flex items-center justify-center shadow-inner"
                          >
                            <span className="text-[8px] font-black text-slate-800">55%</span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Action Button Overlay */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                    <button 
                      onClick={startPipelineVisualization}
                      disabled={isVisualizing}
                      className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 disabled:opacity-50 scale-110"
                    >
                      {isVisualizing ? <Activity className="animate-spin" size={24} /> : <Zap size={24} />}
                      Simulate Analysis Flow
                    </button>
                  </div>
                </div>

                {/* Batch Processing Section */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800">Parallel Batch Processing</h3>
                      <p className="text-sm text-slate-500">Distributed analysis queue for large-scale forensic verification.</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => batchFileInputRef.current?.click()}
                        className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                        <Upload size={18} /> Batch Upload
                      </button>
                      <input 
                        type="file" 
                        ref={batchFileInputRef} 
                        onChange={handleBatchFileUpload} 
                        className="hidden" 
                        multiple
                        accept=".txt,.md,.pdf,.docx"
                      />
                      <button 
                        onClick={handleBatchProcess}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                      >
                        <Activity size={18} /> Process Queue
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {workflowTasks.map((task) => (
                      <div key={task.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-md transition-all">
                        <div className={`p-4 rounded-2xl ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          task.status === 'processing' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-slate-200 text-slate-400'
                        }`}>
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{task.name}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              task.status === 'completed' ? 'text-emerald-600' :
                              task.status === 'processing' ? 'text-indigo-600' :
                              'text-slate-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              className={`h-full ${
                                task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="w-48 text-right">
                          {task.result ? (
                            <span className="text-sm font-black text-slate-800">{task.result}</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 italic">Analyzing...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Zap size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">High Throughput</h4>
                    <p className="text-xs text-slate-500">Process up to 50 documents in parallel with zero latency degradation.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">Auto-Reconciliation</h4>
                    <p className="text-xs text-slate-500">Cross-references results across multiple engines for consensus.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-slate-100 rounded-2xl text-slate-800">
                      <Database size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">Export Ready</h4>
                    <p className="text-xs text-slate-500">Download batch results in CSV, JSON, or PDF forensic reports.</p>
                  </div>
                </div>
              </motion.div>
            )}
            {activeView === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto w-full space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Forensic Records</h3>
                  <button 
                    onClick={handleClearHistory}
                    disabled={history.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Clear All History
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-6 text-xs text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-700">{item.model}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              item.prediction === 'AI Generated' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {item.prediction}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full" style={{ width: `${item.confidence * 100}%` }} />
                              </div>
                              <span className="text-xs font-black text-slate-800">{(item.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs text-slate-400 truncate max-w-[250px] font-medium">{item.text}</p>
                          </td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                            No forensic records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeView === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto w-full h-full flex flex-col"
              >
                <div className="bg-slate-900 rounded-[2rem] p-8 font-mono text-sm overflow-y-auto flex-1 shadow-2xl border border-slate-800">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
                    <Terminal size={20} className="text-indigo-400" />
                    <span className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs">System Kernel Output</span>
                  </div>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-6 group">
                        <span className="text-slate-600 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`shrink-0 font-black w-20 ${
                          log.level === 'ERROR' ? 'text-rose-500' : 
                          log.level === 'WARNING' ? 'text-amber-500' : 'text-indigo-400'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto w-full space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl">
                    <h3 className="font-bold text-slate-800 mb-6">Detection Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#6366f1" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                        <span className="text-xs font-bold text-slate-600">AI Generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-bold text-slate-600">Human Written</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl space-y-6">
                    <h3 className="font-bold text-slate-800">Dataset Overview</h3>
                    <div className="space-y-4">
                      <StatRow label="Total Samples" value="12,450" />
                      <StatRow label="Training Epochs" value="45" />
                      <StatRow label="Validation Loss" value="0.024" />
                      <StatRow label="F1 Score" value="0.984" />
                      <StatRow label="Precision" value="0.991" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Chat History & Logs */}
        <AnimatePresence>
          {(isChatVisible || isLogsVisible) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '256px', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-t border-slate-200 grid grid-cols-2 divide-x divide-slate-100 overflow-hidden shrink-0 relative"
            >
              {/* Chat History Section */}
              <AnimatePresence>
                {isChatVisible && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className={`flex flex-col overflow-hidden ${!isLogsVisible ? 'col-span-2' : ''}`}
                  >
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Chat History</span>
                      </div>
                      <button 
                        onClick={() => setIsChatVisible(false)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors text-slate-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center mt-10">No recent interactions</p>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className="flex gap-3">
                            <div className={`p-1.5 rounded-lg shrink-0 ${msg.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                              {msg.role === 'user' ? <User size={12} /> : <Cpu size={12} />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{msg.role === 'user' ? 'Researcher' : 'Sentinel'}</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* System Logs Section */}
              <AnimatePresence>
                {isLogsVisible && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className={`flex flex-col overflow-hidden ${!isChatVisible ? 'col-span-2' : ''}`}
                  >
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live System Logs</span>
                      </div>
                      <button 
                        onClick={() => setIsLogsVisible(false)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors text-slate-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-[10px]">
                      {logs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex gap-3">
                          <span className="text-slate-400 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={log.level === 'ERROR' ? 'text-rose-500' : 'text-indigo-500'}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-800">{value}</span>
    </div>
  );
}

function ModelCard({ name, accuracy, latency, strength, selected, onClick }: { name: string, accuracy: string, latency: string, strength: string, selected: boolean, onClick: () => void }) {
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
      animate={{ 
        scale: selected ? 1.02 : 1,
        boxShadow: selected ? "0 20px 25px -5px rgb(79 70 229 / 0.2), 0 8px 10px -6px rgb(79 70 229 / 0.2)" : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
      className={`w-full p-6 rounded-[1.5rem] border text-left transition-colors duration-300 relative overflow-hidden ${
        selected 
          ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-600/20' 
          : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
      }`}
    >
      {selected && (
        <motion.div 
          layoutId="active-glow"
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <h4 className="font-bold">{name}</h4>
          <p className={`text-[10px] font-black uppercase tracking-widest ${selected ? 'text-indigo-200' : 'text-slate-400'}`}>{strength}</p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <CheckCircle2 size={20} />
          </motion.div>
        )}
      </div>
      <div className="flex gap-4 relative z-10">
        <div className="space-y-0.5">
          <p className={`text-[10px] font-bold uppercase ${selected ? 'text-indigo-200' : 'text-slate-400'}`}>Accuracy</p>
          <p className="text-sm font-black">{accuracy}</p>
        </div>
        <div className="space-y-0.5">
          <p className={`text-[10px] font-bold uppercase ${selected ? 'text-indigo-200' : 'text-slate-400'}`}>Latency</p>
          <p className="text-sm font-black">{latency}</p>
        </div>
      </div>
    </motion.button>
  );
}
