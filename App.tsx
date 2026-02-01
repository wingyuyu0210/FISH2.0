import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DailyBriefing from './components/DailyBriefing';
import WeeklyCalendar from './components/WeeklyCalendar';
import { WatchlistItem, MarketBriefing, EconomicEvent } from './types';
import { generateDailyBriefing, fetchWeeklyEvents } from './services/geminiService';

// Motivational quotes array
const TRADING_QUOTES = [
  "计划你的交易，交易你的计划。",
  "截断亏损，让利润奔跑。",
  "市场保持非理性的时间可能比你保持偿付能力的时间更长。",
  "风险来自于不知道自己在做什么。",
  "在交易中，耐心是一种美德，更是一种 edge。",
  "不要预测市场，要跟随市场。",
  "成功的交易大约是 10% 的技术，和 90% 的纪律。",
  "趋势是你的朋友，直到它结束。",
  "保住本金是第一原则。",
  "每一笔交易都只是一个概率游戏。",
  "即使在最动荡的市场中，也要保持内心的平静。",
  "永远敬畏市场。",
  "如果你不能控制情绪，你就不能控制金钱。",
  "复利是世界第八大奇迹，在交易中也是如此。"
];

const App: React.FC = () => {
  // State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: '1', symbol: 'BTC', name: 'Bitcoin', assetType: 'crypto' },
    { id: '2', symbol: 'NVDA', name: 'Nvidia', assetType: 'stock' },
    { id: '3', symbol: 'XAU', name: 'Gold', assetType: 'commodity' },
  ]);

  const [briefing, setBriefing] = useState<MarketBriefing | null>(null);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logic to calculate next update session
  const getNextUpdateSession = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const currentTotalMinutes = utcHour * 60 + utcMin;

    const sessions = [
        { name: "欧盘盘前", timeStr: "15:30 (UTC+8)", minutes: 450 }, // 07:30 UTC
        { name: "美盘盘前", timeStr: "21:00 (UTC+8)", minutes: 780 }, // 13:00 UTC
        { name: "亚盘盘前", timeStr: "07:30 (UTC+8)", minutes: 1410 }, // 23:30 UTC
    ];

    const nextSession = sessions.find(s => currentTotalMinutes < s.minutes);
    return nextSession || sessions[0];
  };

  const nextUpdate = getNextUpdateSession();

  // Logic to get a daily consistent quote
  const dailyQuote = useMemo(() => {
    const today = new Date();
    // Use day of year to select index
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return TRADING_QUOTES[dayOfYear % TRADING_QUOTES.length];
  }, []);

  // Handlers
  const handleAddAsset = (symbol: string) => {
    if (watchlist.some(w => w.symbol === symbol)) return;
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      symbol,
      name: symbol,
      assetType: 'stock' 
    };
    setWatchlist([...watchlist, newItem]);
  };

  const handleRemoveAsset = (id: string) => {
    setWatchlist(watchlist.filter(w => w.id !== id));
  };

  const loadData = async () => {
    if (watchlist.length === 0) return;
    setError(null);
    setLoadingBriefing(true);
    setLoadingEvents(true);

    const symbols = watchlist.map(w => w.symbol);

    try {
      generateDailyBriefing(symbols)
        .then(data => {
            setBriefing(data);
            setLoadingBriefing(false);
        })
        .catch(err => {
            console.error(err);
            setError("简报生成失败。请检查 API 密钥或重试。");
            setLoadingBriefing(false);
        });

      fetchWeeklyEvents(symbols)
        .then(data => {
            setEvents(data);
            setLoadingEvents(false);
        })
        .catch(err => {
            console.error(err);
            setLoadingEvents(false); 
        });

    } catch (e) {
      setError("发生意外错误。");
      setLoadingBriefing(false);
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (watchlist.length === 0) {
      setBriefing(null);
      setEvents([]);
    }
  }, [watchlist]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* 1. LEFT COLUMN: Sidebar (Fixed Width matching Right Column) */}
      <Sidebar 
        watchlist={watchlist}
        onAddAsset={handleAddAsset}
        onRemoveAsset={handleRemoveAsset}
      />

      {/* 2. MIDDLE COLUMN: Dashboard (Flex Grow - Largest) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 min-w-0 border-r border-gray-900 custom-scrollbar">
        
        {/* Header Section */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">仪表盘 (Dashboard)</h1>
            <p className="text-emerald-500/80 text-sm font-medium italic mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              "{dailyQuote}"
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 px-5 py-2.5 rounded-xl shadow-lg shadow-black/50 self-start">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">下一次更新</span>
                <span className="text-sm font-bold text-emerald-400">{nextUpdate.name}</span>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500">预计时间</span>
                <span className="text-xs font-mono text-gray-300">{nextUpdate.timeStr}</span>
            </div>
            <div className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          </div>
        </header>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
        )}

        {/* Daily Briefing Content */}
        <div className="w-full">
          <DailyBriefing 
            briefing={briefing}
            isLoading={loadingBriefing}
            onGenerate={loadData}
            hasWatchlist={watchlist.length > 0}
          />
        </div>
      </main>

      {/* 3. RIGHT COLUMN: Weekly Events (Fixed Width matching Left Column) */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-gray-900/30 border-l border-gray-800 flex flex-col h-[50vh] md:h-full">
         <div className="flex-1 overflow-hidden p-4">
            <WeeklyCalendar 
              events={events}
              isLoading={loadingEvents}
              onRefresh={() => fetchWeeklyEvents(watchlist.map(w => w.symbol)).then(setEvents)}
              hasWatchlist={watchlist.length > 0}
            />
         </div>
         <div className="p-4 pt-0">
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 p-5 rounded-xl">
               <h4 className="text-indigo-400 font-medium text-sm mb-2">专业提示 (Pro Tip)</h4>
               <p className="text-xs text-gray-400 leading-relaxed">
                 市场观察现已调整为跟随亚盘、欧盘和美盘的开盘节奏。请在 {nextUpdate.name} 左右刷新页面获取最新盘前简报。
               </p>
            </div>
         </div>
      </aside>

    </div>
  );
};

export default App;