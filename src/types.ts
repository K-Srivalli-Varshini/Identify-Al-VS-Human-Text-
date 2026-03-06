export interface HistoryRecord {
  id: number;
  text: string;
  prediction: string;
  confidence: number;
  model: string;
  timestamp: string;
}

export interface LogEntry {
  id: number;
  level: string;
  message: string;
  timestamp: string;
}

export interface AnalysisResult {
  prediction: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
  model: string;
  isSimulation?: boolean;
}

export type ViewType = 'home' | 'detection' | 'models' | 'history' | 'logs' | 'stats' | 'workflow';
