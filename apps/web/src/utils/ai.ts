
import type { AIConfig } from '../types/third-party';


import { ThirdPartyManager } from '../services/third-party-manager';

export interface CompletionRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  responseFormat?: 'url' | 'b64_json';
}

export interface ModerationRequest {
  input: string | string[];
  model?: string;
}

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    threatening: boolean;
    selfHarm: boolean;
    sexual: boolean;
    violence: boolean;
    graphic: boolean;
  };
  scores: {
    hate: number;
    threatening: number;
    selfHarm: number;
    sexual: number;
    violence: number;
    graphic: number;
  };
}

export interface FineTuneRequest {
  trainingFile: string;
  model?: string;
  validationFile?: string;
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  prompt?: string;
  suffix?: string;
}

export interface FineTuneStatus {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  model: string;
  createdAt: Date;
  finishedAt?: Date;
  trainingLoss?: number;
  validationLoss?: number;
}

export interface ModelInfo {
  id: string;
  name: string;

  type: 'base' | 'fine-tuned';
  provider: string;
  capabilities: string[];
  maxTokens: number;
  trainingData?: string;
  createdAt: Date;
}

export class AIUtils {
  private static manager = ThirdPartyManager?.getInstance();
  private static cache = new Map<string, any>();

  private static getCacheKey(prefix: string, request: any): string {
    return `${prefix}:${JSON?.stringify(request)}`;
  }

  static async createCompletion(request: CompletionRequest): Promise<string> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    if (config?.caching?.enabled) {
      const cacheKey = this?.getCacheKey('completion', request);
      const cached = this?.cache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      switch (config?.service) {
        case 'openai': {
          const completion = await ai?.completions.create({
            model: request?.model || config?.models[0],
            prompt: request?.prompt,
            max_tokens: request?.maxTokens || config?.maxTokens,
            temperature: request?.temperature || config?.temperature,
            top_p: request?.topP,
            stop: request?.stop,
            stream: request?.stream,
          });

          const result = completion?.choices[0].text;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('completion', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        case 'cohere': {
          const response = await ai?.generate({
            model: request?.model || config?.models[0],
            prompt: request?.prompt,
            max_tokens: request?.maxTokens || config?.maxTokens,
            temperature: request?.temperature || config?.temperature,
            stop_sequences: request?.stop,
            stream: request?.stream,
          });

          const result = response?.generations[0].text;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('completion', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        case 'anthropic': {
          const completion = await ai?.complete({
            prompt: request?.prompt,
            model: request?.model || config?.models[0],
            max_tokens_to_sample: request?.maxTokens || config?.maxTokens,
            temperature: request?.temperature || config?.temperature,
            stop_sequences: request?.stop,
          });

          const result = completion?.completion;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('completion', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        default:
          throw new Error(`Unsupported AI service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to create completion:', error);
      throw error;
    }
  }

  static async createChatCompletion(request: ChatRequest): Promise<string> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    if (config?.caching?.enabled) {
      const cacheKey = this?.getCacheKey('chat', request);
      const cached = this?.cache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      switch (config?.service) {
        case 'openai': {
          const completion = await ai?.chat.completions?.create({
            model: request?.model || config?.models[0],
            messages: request?.messages,
            max_tokens: request?.maxTokens || config?.maxTokens,
            temperature: request?.temperature || config?.temperature,
            top_p: request?.topP,
            stop: request?.stop,
            stream: request?.stream,
          });

          const result = completion?.choices[0].message?.content;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('chat', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        case 'anthropic': {
          const messages = request?.messages.map((msg) => ({
            role: msg?.role,
            content: msg?.content,
          }));

          const completion = await ai?.messages.create({
            model: request?.model || config?.models[0],
            messages,
            max_tokens: request?.maxTokens || config?.maxTokens,
            temperature: request?.temperature || config?.temperature,
            stop_sequences: request?.stop,
          });

          const result = completion?.content[0].text;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('chat', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        default:
          throw new Error(`Unsupported chat service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to create chat completion:', error);
      throw error;
    }
  }

  static async createEmbedding(request: EmbeddingRequest): Promise<number[][]> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    if (config?.caching?.enabled) {
      const cacheKey = this?.getCacheKey('embedding', request);
      const cached = this?.cache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      switch (config?.service) {
        case 'openai': {
          const response = await ai?.embeddings.create({


            model: request?.model || 'text-embedding-ada-002',
            input: request?.input,
          });

          const result = response?.data.map((item) => item?.embedding);

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('embedding', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        case 'cohere': {
          const response = await ai?.embed({
            model: request?.model || config?.models[0],
            texts: Array?.isArray(request?.input) ? request?.input : [request?.input],
          });

          const result = response?.embeddings;

          if (config?.caching?.enabled) {
            const cacheKey = this?.getCacheKey('embedding', request);
            this?.cache.set(cacheKey, result);

            setTimeout(() => this?.cache.delete(cacheKey), config?.caching.ttl * 1000);
          }

          return result;
        }

        default:
          throw new Error(`Unsupported embedding service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to create embedding:', error);
      throw error;
    }
  }

  static async generateImage(request: ImageGenerationRequest): Promise<string[]> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    try {
      switch (config?.service) {
        case 'openai': {
          const response = await ai?.images.generate({

            model: 'dall-e-3',
            prompt: request?.prompt,
            n: request?.n || 1,
            size: request?.size || '1024x1024',
            response_format: request?.responseFormat || 'url',
          });

          return response?.data.map((item) =>
            request?.responseFormat === 'b64_json' ? item?.b64_json : item?.url,
          );
        }

        default:
          throw new Error(`Unsupported image generation service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to generate image:', error);
      throw error;
    }
  }

  static async moderateContent(request: ModerationRequest): Promise<ModerationResult> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    try {
      switch (config?.service) {
        case 'openai': {
          const response = await ai?.moderations.create({
            input: request?.input,

            model: request?.model || 'text-moderation-latest',
          });

          const result = response?.results[0];
          return {
            flagged: result?.flagged,
            categories: {
              hate: result?.categories.hate,
              threatening: result?.categories.threatening,

              selfHarm: result?.categories['self-harm'],
              sexual: result?.categories.sexual,
              violence: result?.categories.violence,
              graphic: result?.categories.graphic,
            },
            scores: {
              hate: result?.category_scores.hate,
              threatening: result?.category_scores.threatening,

              selfHarm: result?.category_scores['self-harm'],
              sexual: result?.category_scores.sexual,
              violence: result?.category_scores.violence,
              graphic: result?.category_scores.graphic,
            },
          };
        }

        case 'anthropic': {
          // Anthropic's moderation is built into their API responses
          throw new Error('Standalone moderation not supported for Anthropic');
        }

        default:
          throw new Error(`Unsupported moderation service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to moderate content:', error);
      throw error;
    }
  }

  static async createFineTune(request: FineTuneRequest): Promise<string> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    try {
      switch (config?.service) {
        case 'openai': {
          const fineTune = await ai?.fineTuning.jobs?.create({
            training_file: request?.trainingFile,

            model: request?.model || 'gpt-3?.5-turbo',
            validation_file: request?.validationFile,
            hyperparameters: {
              n_epochs: request?.epochs,
              batch_size: request?.batchSize,
              learning_rate_multiplier: request?.learningRate,
            },
          });

          return fineTune?.id;
        }

        default:

          throw new Error(`Unsupported fine-tuning service: ${config?.service}`);
      }
    } catch (error) {

      console?.error('Failed to create fine-tune:', error);
      throw error;
    }
  }

  static async getFineTuneStatus(fineTuneId: string): Promise<FineTuneStatus> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    try {
      switch (config?.service) {
        case 'openai': {
          const job = await ai?.fineTuning.jobs?.retrieve(fineTuneId);

          return {
            id: job?.id,
            status: job?.status as 'pending' | 'running' | 'succeeded' | 'failed',
            model: job?.fine_tuned_model || job?.model,

            createdAt: new Date(job?.created_at * 1000),

            finishedAt: job?.finished_at ? new Date(job?.finished_at * 1000) : undefined,
            trainingLoss: job?.training_metrics?.training_loss,
            validationLoss: job?.training_metrics?.validation_loss,
          };
        }

        default:

          throw new Error(`Unsupported fine-tuning service: ${config?.service}`);
      }
    } catch (error) {

      console?.error('Failed to get fine-tune status:', error);
      throw error;
    }
  }

  static async listModels(): Promise<ModelInfo[]> {
    const ai = this?.manager.getService('ai');
    if (!ai) throw new Error('AI service not initialized');

    const config = this?.manager.getServiceConfig('ai') as AIConfig;

    try {
      switch (config?.service) {
        case 'openai': {
          const models = await ai?.models.list();

          return models?.data.map((model) => ({
            id: model?.id,
            name: model?.id,

            type: model?.id.startsWith('ft:') ? 'fine-tuned' : 'base',
            provider: 'openai',
            capabilities: this?.getModelCapabilities(model?.id),
            maxTokens: model?.context_window || 4096,

            createdAt: new Date(model?.created * 1000),
          }));
        }

        case 'anthropic': {
          return config?.models.map((modelId) => ({
            id: modelId,
            name: modelId,
            type: 'base',
            provider: 'anthropic',
            capabilities: this?.getModelCapabilities(modelId),
            maxTokens: 100000, // Claude models typically support very long contexts
            createdAt: new Date(),
          }));
        }

        case 'cohere': {
          const models = await ai?.listModels();

          return models?.map((model) => ({
            id: model?.id,
            name: model?.name,
            type: 'base',
            provider: 'cohere',
            capabilities: this?.getModelCapabilities(model?.id),
            maxTokens: model?.max_tokens || 4096,
            createdAt: new Date(),
          }));
        }

        default:
          throw new Error(`Unsupported model listing service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to list models:', error);
      throw error;
    }
  }

  private static getModelCapabilities(modelId: string): string[] {

    const capabilities: string[] = ['text-generation'];


    if (modelId?.includes('gpt-4') || modelId?.includes('claude')) {


      capabilities?.push('advanced-reasoning', 'code-generation');
    }

    if (modelId?.includes('vision')) {

      capabilities?.push('image-understanding');
    }

    if (modelId?.includes('embedding')) {
      capabilities?.push('embeddings');
    }


    if (modelId?.includes('dall-e')) {

      capabilities?.push('image-generation');
    }

    return capabilities;
  }
}
