import { Configuration, OpenAIApi } from 'openai';
import { logger } from './logger';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // Range from -1 to 1
  aspects: {
    [key: string]: {
      sentiment: 'positive' | 'negative' | 'neutral';
      score: number;
      keywords: string[];
    };
  };
}

export class SentimentAnalysisService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Analyze sentiment of a review text using OpenAI's API
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      const response = await this.openai.createCompletion({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Analyze the sentiment of the following review. Consider the overall sentiment and specific aspects mentioned. Format the response as JSON with sentiment (positive/negative/neutral), score (-1 to 1), and aspects mentioned:\n\n${text}`,
        max_tokens: 150,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.data.choices[0].text || '{}');

      logger.info('Sentiment analysis completed', 'SentimentAnalysis', {
        text: text.substring(0, 50) + '...',
      });

      return {
        sentiment: analysis.sentiment || 'neutral',
        score: analysis.score || 0,
        aspects: analysis.aspects || {},
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error analyzing sentiment', 'SentimentAnalysis', { error: errorMessage });

      // Return neutral sentiment as fallback
      return {
        sentiment: 'neutral',
        score: 0,
        aspects: {},
      };
    }
  }

  /**
   * Analyze sentiment from multiple reviews and aggregate results
   */
  async analyzeMultipleReviews(reviews: string[]): Promise<{
    overallSentiment: SentimentResult;
    commonAspects: { [key: string]: number };
  }> {
    try {
      const results = await Promise.all(reviews.map((review) => this.analyzeSentiment(review)));

      // Calculate overall sentiment score
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const averageScore = totalScore / results.length;

      // Aggregate aspects
      const aspectCounts: { [key: string]: number } = {};
      results.forEach((result) => {
        Object.keys(result.aspects).forEach((aspect) => {
          aspectCounts[aspect] = (aspectCounts[aspect] || 0) + 1;
        });
      });

      return {
        overallSentiment: {
          sentiment: this.scoreToSentiment(averageScore),
          score: averageScore,
          aspects: this.aggregateAspects(results),
        },
        commonAspects: aspectCounts,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error analyzing multiple reviews', 'SentimentAnalysis', {
        error: errorMessage,
      });
      throw error;
    }
  }

  private scoreToSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  private aggregateAspects(results: SentimentResult[]): SentimentResult['aspects'] {
    const aspects: SentimentResult['aspects'] = {};

    results.forEach((result) => {
      Object.entries(result.aspects).forEach(([aspect, data]) => {
        if (!aspects[aspect]) {
          aspects[aspect] = {
            sentiment: 'neutral',
            score: 0,
            keywords: [],
          };
        }

        aspects[aspect].score += data.score;
        aspects[aspect].keywords = [...new Set([...aspects[aspect].keywords, ...data.keywords])];
      });
    });

    // Average the scores and determine sentiment
    Object.keys(aspects).forEach((aspect) => {
      aspects[aspect].score /= results.length;
      aspects[aspect].sentiment = this.scoreToSentiment(aspects[aspect].score);
    });

    return aspects;
  }
}
