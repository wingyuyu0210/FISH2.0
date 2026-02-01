import React from 'react';
import { EconomicEvent, ImpactLevel } from '../types';

interface WeeklyCalendarProps {
  events: EconomicEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  hasWatchlist: boolean;
}

const getImpactColor = (impact: ImpactLevel) => {
  switch (impact) {
    case ImpactLevel.HIGH: return 'bg-red-500/20 text-red-400 border-red-500/30';
    case ImpactLevel.MEDIUM: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case ImpactLevel.LOW: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getImpactLabel = (impact: ImpactLevel) => {
  switch (impact) {
    case ImpactLevel.HIGH: return '高';
    case ImpactLevel.MEDIUM: return '中';
    case ImpactLevel.LOW: return '低';
    default: return impact;
  }
};

const EventRow: React.FC<{ evt: EconomicEvent }> = ({ evt }) => (
  <tr className="hover:bg-gray-800/50 transition-colors group">
    <td className="p-3">
      <div className="text-xs text-white font-mono">{evt.date}</div>
      <div className="text-[10px] text-gray-500">{evt.time}</div>
    </td>
    <td className="p-3">
      <div className="text-sm text-gray-200 font-medium">{evt.event}</div>
      {evt.relatedAsset && <div className="text-[10px] text-emerald-500 mt-0.5">{evt.relatedAsset}</div>}
      {evt.forecast && <div className="text-[10px] text-gray-500 mt-0.5">预测: {evt.forecast}</div>}
    </td>
    <td className="p-3 text-right">
      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getImpactColor(evt.impact)}`}>
          {getImpactLabel(evt.impact)}
      </span>
    </td>
  </tr>
);

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ events, isLoading, onRefresh, hasWatchlist }) => {
  
  // Helper to format today's date to match API YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();
  const todayEvents = events.filter(e => e.date === todayStr);
  const otherEvents = events.filter(e => e.date !== todayStr);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header - Fixed */}
      <div className="flex-none p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-20">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          本周大事
        </h2>
        <button 
            onClick={onRefresh}
            disabled={isLoading || !hasWatchlist}
            className={`p-2 rounded hover:bg-gray-800 transition-colors ${isLoading ? 'animate-spin' : ''}`}
        >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex-1 p-4 space-y-3 overflow-hidden">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-850 rounded animate-pulse"></div>)}
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm">
            <p>未发现近期重大事件。</p>
            {hasWatchlist && <button onClick={onRefresh} className="text-emerald-500 hover:underline mt-2">扫描日历</button>}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* 1. Today's Events - PINNED at the top of the content area */}
          {todayEvents.length > 0 && (
            <div className="flex-none bg-gray-900 border-b border-gray-800 shadow-md z-10">
              <div className="bg-emerald-900/10 px-4 py-2 border-l-4 border-emerald-500 flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">今日重要经济数据</h3>
              </div>
              <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-gray-800">
                        {todayEvents.map((evt, idx) => <EventRow key={`today-${idx}`} evt={evt} />)}
                    </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Upcoming Events - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-850 text-xs text-gray-400 uppercase tracking-wider sticky top-0 z-0">
                <tr>
                    <th className="p-3 pl-4 font-medium" colSpan={3}>未来日程</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {otherEvents.map((evt, idx) => <EventRow key={`other-${idx}`} evt={evt} />)}
              </tbody>
            </table>
            {otherEvents.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm italic">无更多日程</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;