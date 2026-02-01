export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
}

export enum ImpactLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  impact: ImpactLevel;
  forecast?: string;
  previous?: string;
  relatedAsset?: string;
}

export interface MarketBriefing {
  date: string;
  summary: string;
  keyTakeaways: string[];
  sentimentScore: number; // 0-100
  sources: { title: string; uri: string }[];
}

export interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;
}
