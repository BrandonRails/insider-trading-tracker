/**
 * Sentiment Analysis Agent
 * Analyzes news articles, social media, and market sentiment related to stocks with insider activity
 */

import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';
import { InsiderTrade } from '../collectors/SECFilingAgent';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: string;
  url: string;
  ticker?: string;
  relevanceScore: number; // 0-1 scale
}

export interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'reddit' | 'stocktwits' | 'seeking_alpha';
  content: string;
  author: string;
  publishedAt: string;
  url?: string;
  ticker?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  influenceScore: number; // 0-1 based on author credibility
}

export interface SentimentAnalysis {
  ticker: string;
  sentiment: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  confidence: number; // 0-1 scale
  score: number; // -1 to 1, where -1 is very bearish, 1 is very bullish
  sourceBreakdown: {
    news: {
      articles: number;
      avgSentiment: number;
    };
    social: {
      posts: number;
      avgSentiment: number;
    };
  };
  keyTopics: string[];
  trends: {
    short: 'improving' | 'declining' | 'stable'; // 24h trend
    medium: 'improving' | 'declining' | 'stable'; // 7d trend
  };
}

export interface MarketMood {
  overall: 'fear' | 'greed' | 'neutral';
  fearGreedIndex: number; // 0-100 scale
  sectors: {
    name: string;
    sentiment: number;
    topMentions: string[];
  }[];
  emergingThemes: string[];
}

export interface SentimentResult {
  tickerSentiments: SentimentAnalysis[];
  marketMood: MarketMood;
  newsArticles: NewsArticle[];
  socialPosts: SocialMediaPost[];
  summary: {
    totalSources: number;
    bullishTickers: number;
    bearishTickers: number;
    highConfidenceSignals: number;
    analysisTime: string;
  };
}

export class SentimentAgent extends BaseAgent {
  private readonly NEWS_SOURCES = [
    'reuters.com',
    'bloomberg.com',
    'cnbc.com',
    'marketwatch.com',
    'fool.com',
    'seekingalpha.com'
  ];

  private sentimentCache = new Map<string, SentimentAnalysis>();
  private newsCache: NewsArticle[] = [];
  private socialCache: SocialMediaPost[] = [];

  constructor(config: Partial<AgentConfig> = {}) {
    super({
      name: 'Sentiment Analysis Agent',
      enabled: true,
      interval: 20 * 60 * 1000, // Analyze every 20 minutes
      ...config
    });
  }

  async execute(): Promise<AgentResult<SentimentResult>> {
    this.log('info', 'Starting sentiment analysis...');

    try {
      // Get tickers with recent insider activity
      const activeTickers = await this.getActiveTickerList();
      
      if (activeTickers.length === 0) {
        this.log('warn', 'No active tickers found for sentiment analysis');
        return {
          success: true,
          data: this.getEmptyResult()
        };
      }

      // Collect news and social media data
      const newsArticles = await this.collectNewsData(activeTickers);
      const socialPosts = await this.collectSocialData(activeTickers);
      
      // Analyze sentiment for each ticker
      const tickerSentiments = await this.analyzeSentiments(activeTickers, newsArticles, socialPosts);
      
      // Generate market mood analysis
      const marketMood = await this.analyzeMarketMood(tickerSentiments, newsArticles, socialPosts);

      const result: SentimentResult = {
        tickerSentiments,
        marketMood,
        newsArticles,
        socialPosts,
        summary: {
          totalSources: newsArticles.length + socialPosts.length,
          bullishTickers: tickerSentiments.filter(s => s.score > 0.2).length,
          bearishTickers: tickerSentiments.filter(s => s.score < -0.2).length,
          highConfidenceSignals: tickerSentiments.filter(s => s.confidence > 0.8).length,
          analysisTime: new Date().toISOString()
        }
      };

      this.log('info', `Sentiment analysis complete: ${tickerSentiments.length} tickers, ${result.summary.totalSources} sources`);
      return {
        success: true,
        data: result
      };

    } catch (error) {
      this.log('error', 'Sentiment analysis failed', error);
      throw error;
    }
  }

  validate(data: SentimentResult): boolean {
    return (
      Array.isArray(data.tickerSentiments) &&
      data.marketMood &&
      Array.isArray(data.newsArticles) &&
      Array.isArray(data.socialPosts) &&
      data.summary &&
      typeof data.summary.totalSources === 'number'
    );
  }

  private async getActiveTickerList(): Promise<string[]> {
    // In production, get tickers with recent insider activity from database
    // For demo, return mock active tickers
    return ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL'];
  }

  private async collectNewsData(tickers: string[]): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    
    // Simulate API calls to news sources
    await this.delay(800);

    // Generate mock news articles
    const mockTitles = [
      'Tech Giants Show Strong Earnings Potential',
      'AI Revolution Drives Semiconductor Growth',
      'Electric Vehicle Market Faces New Challenges',
      'Cloud Computing Dominance Continues',
      'Regulatory Concerns Impact Big Tech Stocks'
    ];

    for (let i = 0; i < 8; i++) {
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      const title = mockTitles[Math.floor(Math.random() * mockTitles.length)];
      
      articles.push({
        id: `news-${Date.now()}-${i}`,
        title: `${title} - ${ticker} Analysis`,
        content: this.generateMockNewsContent(ticker, title),
        source: this.NEWS_SOURCES[Math.floor(Math.random() * this.NEWS_SOURCES.length)],
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        url: `https://example.com/news/${i}`,
        ticker,
        relevanceScore: 0.6 + Math.random() * 0.4
      });
    }

    return articles;
  }

  private async collectSocialData(tickers: string[]): Promise<SocialMediaPost[]> {
    const posts: SocialMediaPost[] = [];
    
    // Simulate API calls to social platforms
    await this.delay(600);

    const platforms: SocialMediaPost['platform'][] = ['twitter', 'reddit', 'stocktwits', 'seeking_alpha'];
    const mockPosts = [
      '$TICKER looking strong after insider buying!',
      'Bullish on $TICKER - fundamentals are solid',
      'Concerned about $TICKER valuation at these levels',
      'Major insider activity in $TICKER worth watching',
      '$TICKER earnings should be interesting next quarter'
    ];

    for (let i = 0; i < 12; i++) {
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const content = mockPosts[Math.floor(Math.random() * mockPosts.length)].replace('$TICKER', `$${ticker}`);
      
      posts.push({
        id: `social-${Date.now()}-${i}`,
        platform,
        content,
        author: `user${Math.floor(Math.random() * 1000)}`,
        publishedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
        url: `https://${platform}.com/post/${i}`,
        ticker,
        engagement: {
          likes: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 25)
        },
        influenceScore: Math.random()
      });
    }

    return posts;
  }

  private async analyzeSentiments(
    tickers: string[],
    articles: NewsArticle[],
    posts: SocialMediaPost[]
  ): Promise<SentimentAnalysis[]> {
    const sentiments: SentimentAnalysis[] = [];

    for (const ticker of tickers) {
      const tickerArticles = articles.filter(a => a.ticker === ticker);
      const tickerPosts = posts.filter(p => p.ticker === ticker);

      if (tickerArticles.length === 0 && tickerPosts.length === 0) {
        continue;
      }

      // Calculate sentiment scores (simplified NLP simulation)
      const newsScore = this.calculateNewsScore(tickerArticles);
      const socialScore = this.calculateSocialScore(tickerPosts);
      
      // Weighted average (news gets higher weight due to quality)
      const overallScore = (newsScore * 0.7 + socialScore * 0.3);
      const confidence = this.calculateConfidence(tickerArticles.length, tickerPosts.length);

      sentiments.push({
        ticker,
        sentiment: this.scoreToSentiment(overallScore),
        confidence,
        score: overallScore,
        sourceBreakdown: {
          news: {
            articles: tickerArticles.length,
            avgSentiment: newsScore
          },
          social: {
            posts: tickerPosts.length,
            avgSentiment: socialScore
          }
        },
        keyTopics: this.extractKeyTopics(ticker, tickerArticles, tickerPosts),
        trends: {
          short: this.calculateTrend('short', ticker),
          medium: this.calculateTrend('medium', ticker)
        }
      });
    }

    return sentiments;
  }

  private calculateNewsScore(articles: NewsArticle[]): number {
    if (articles.length === 0) return 0;

    // Simulate sentiment analysis on news content
    let totalScore = 0;
    let totalWeight = 0;

    for (const article of articles) {
      // Mock sentiment scoring based on keywords and relevance
      const sentimentScore = this.mockSentimentAnalysis(article.content);
      const weight = article.relevanceScore;
      
      totalScore += sentimentScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculateSocialScore(posts: SocialMediaPost[]): number {
    if (posts.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    for (const post of posts) {
      const sentimentScore = this.mockSentimentAnalysis(post.content);
      const weight = post.influenceScore * Math.log(post.engagement.likes + post.engagement.shares + 1);
      
      totalScore += sentimentScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private mockSentimentAnalysis(text: string): number {
    // Simplified keyword-based sentiment analysis
    const bullishWords = ['strong', 'bullish', 'growth', 'positive', 'buy', 'opportunity', 'solid'];
    const bearishWords = ['weak', 'bearish', 'decline', 'negative', 'sell', 'concern', 'risk'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    for (const word of words) {
      if (bullishWords.some(bw => word.includes(bw))) {
        score += 0.1;
      }
      if (bearishWords.some(bw => word.includes(bw))) {
        score -= 0.1;
      }
    }

    // Add some randomness to simulate real NLP
    score += (Math.random() - 0.5) * 0.3;

    return Math.max(-1, Math.min(1, score));
  }

  private calculateConfidence(newsCount: number, socialCount: number): number {
    const totalSources = newsCount + socialCount;
    
    // More sources = higher confidence, with diminishing returns
    let confidence = Math.min(totalSources / 10, 0.8);
    
    // Bonus for having both news and social sources
    if (newsCount > 0 && socialCount > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  private scoreToSentiment(score: number): SentimentAnalysis['sentiment'] {
    if (score >= 0.5) return 'very_bullish';
    if (score >= 0.2) return 'bullish';
    if (score <= -0.5) return 'very_bearish';
    if (score <= -0.2) return 'bearish';
    return 'neutral';
  }

  private extractKeyTopics(ticker: string, articles: NewsArticle[], posts: SocialMediaPost[]): string[] {
    // Simulate topic extraction
    const topics = ['earnings', 'growth', 'competition', 'regulation', 'innovation'];
    return topics.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private calculateTrend(period: 'short' | 'medium', ticker: string): 'improving' | 'declining' | 'stable' {
    // Simulate trend calculation by comparing with cached historical data
    const trends = ['improving', 'declining', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private async analyzeMarketMood(
    sentiments: SentimentAnalysis[],
    articles: NewsArticle[],
    posts: SocialMediaPost[]
  ): Promise<MarketMood> {
    // Calculate overall market sentiment
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    const fearGreedIndex = Math.round(((avgSentiment + 1) / 2) * 100);
    let overall: MarketMood['overall'] = 'neutral';
    
    if (fearGreedIndex < 25) overall = 'fear';
    else if (fearGreedIndex > 75) overall = 'greed';

    return {
      overall,
      fearGreedIndex,
      sectors: [
        {
          name: 'Technology',
          sentiment: avgSentiment + (Math.random() - 0.5) * 0.2,
          topMentions: ['AAPL', 'MSFT', 'NVDA']
        },
        {
          name: 'Automotive',
          sentiment: avgSentiment + (Math.random() - 0.5) * 0.3,
          topMentions: ['TSLA']
        }
      ],
      emergingThemes: ['AI Growth', 'EV Adoption', 'Cloud Computing']
    };
  }

  private generateMockNewsContent(ticker: string, title: string): string {
    return `Recent analysis of ${ticker} shows ${title.toLowerCase()}. Market participants are closely watching insider trading activity and earnings projections for the upcoming quarter. The stock has seen increased attention from both retail and institutional investors.`;
  }

  private getEmptyResult(): SentimentResult {
    return {
      tickerSentiments: [],
      marketMood: {
        overall: 'neutral',
        fearGreedIndex: 50,
        sectors: [],
        emergingThemes: []
      },
      newsArticles: [],
      socialPosts: [],
      summary: {
        totalSources: 0,
        bullishTickers: 0,
        bearishTickers: 0,
        highConfidenceSignals: 0,
        analysisTime: new Date().toISOString()
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for external access
  getTickerSentiment(ticker: string): SentimentAnalysis | null {
    return this.sentimentCache.get(ticker) || null;
  }

  getRecentNews(ticker?: string, limit = 10): NewsArticle[] {
    const filtered = ticker 
      ? this.newsCache.filter(article => article.ticker === ticker)
      : this.newsCache;
    
    return filtered.slice(-limit);
  }

  getRecentSocial(ticker?: string, limit = 20): SocialMediaPost[] {
    const filtered = ticker
      ? this.socialCache.filter(post => post.ticker === ticker)
      : this.socialCache;
    
    return filtered.slice(-limit);
  }
}