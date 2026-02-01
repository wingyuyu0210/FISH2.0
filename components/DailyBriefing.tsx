import React from 'react';
import { MarketBriefing } from '../types';

interface DailyBriefingProps {
  briefing: MarketBriefing | null;
  isLoading: boolean;
  onGenerate: () => void;
  hasWatchlist: boolean;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ briefing, isLoading, onGenerate, hasWatchlist }) => {
  if (!briefing && !isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">每日市场观察</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          利用 Gemini 搜索生成您关注资产的全面 AI 市场分析 (昨日表现回顾)。
        </p>
        <button
          onClick={onGenerate}
          disabled={!hasWatchlist}
          className={`px-6 py-3 rounded-lg font-medium transition-all transform active:scale-95 ${
            hasWatchlist 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasWatchlist ? '生成简报' : '请先添加资产'}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-800 rounded"></div>
            <div className="h-24 bg-gray-800 rounded"></div>
        </div>
        <div className="mt-6 flex items-center justify-center text-emerald-500 text-sm font-mono">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            正在分析市场数据源...
        </div>
      </div>
    );
  }

  // Sentiment Color
  const getSentimentColor = (score: number) => {
    if (score >= 60) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score <= 40) return 'text-red-400 border-red-500/30 bg-red-500/10';
    return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  };

  const sentimentColor = getSentimentColor(briefing?.sentimentScore || 50);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-850/50">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-xl font-bold text-white">市场简报</h2>
             <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{briefing?.date}</span>
          </div>
          <p className="text-sm text-gray-400">AI 自动生成的每日观察</p>
        </div>
        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${sentimentColor}`}>
           <span className="text-2xl font-bold font-mono">{briefing?.sentimentScore}</span>
           <span className="text-[10px] uppercase font-semibold opacity-80">情绪指数</span>
        </div>
      </div>

      <div className="p-6">
        <div className="prose prose-invert prose-sm max-w-none mb-8">
            <div className="whitespace-pre-line text-gray-300 leading-relaxed">
                {briefing?.summary}
            </div>
        </div>

        <div className="bg-gray-850 rounded-lg p-5 border border-gray-800 mb-6">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">关键要点 (Key Takeaways)</h3>
          <ul className="space-y-2">
            {briefing?.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {briefing?.sources && briefing.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">验证来源 (Sources)</h4>
            <div className="flex flex-wrap gap-2">
              {briefing.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-950 p-3 text-center border-t border-gray-800">
         <button onClick={onGenerate} className="text-xs text-gray-500 hover:text-white transition-colors">
            刷新分析结果
         </button>
      </div>
    </div>
  );
};

export default DailyBriefing;