import React, { useState } from 'react';
import { WatchlistItem } from '../types';

interface SidebarProps {
  watchlist: WatchlistItem[];
  onAddAsset: (symbol: string) => void;
  onRemoveAsset: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ watchlist, onAddAsset, onRemoveAsset }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddAsset(inputValue.trim().toUpperCase());
      setInputValue('');
    }
  };

  return (
    <aside className="w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0 z-20">
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          FISH的金融观察
        </h1>
        <p className="text-xs text-gray-500 mt-1">AI 驱动的市场情报</p>
      </div>

      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">关注列表 (Watchlist)</h2>
        
        <form onSubmit={handleSubmit} className="mb-4 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="添加代码 (如 NVDA)"
              className="w-full bg-gray-850 border border-gray-700 text-gray-200 text-sm rounded-md py-2 pl-3 pr-8 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 text-gray-400 hover:text-white"
              disabled={!inputValue}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </form>

        <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {watchlist.map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="font-mono font-medium text-gray-200">{item.symbol}</span>
                <span className="text-[10px] text-gray-500">{item.assetType}</span>
              </div>
              <button 
                onClick={() => onRemoveAsset(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {watchlist.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm italic">
              暂无关注资产，请在上方添加。
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          系统运行正常
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;