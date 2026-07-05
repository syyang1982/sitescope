import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  descriptionEn: string;
  badge?: string;
  badgeEn?: string;
}

// Built-in models — both use MIMO_API_KEY
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'mimo-v2.5-pro',
    name: 'MiMo v2.5 Pro',
    provider: 'Xiaomi',
    description: '最强推理能力，适合深度审查',
    descriptionEn: 'Best reasoning, ideal for deep audits',
    badge: '推荐',
    badgeEn: 'Top Pick',
  },
  {
    id: 'mimo-v2.5',
    name: 'MiMo v2.5',
    provider: 'Xiaomi',
    description: '更快响应，适合快速审查',
    descriptionEn: 'Faster response, ideal for quick audits',
    badge: '快速',
    badgeEn: 'Fast',
  },
];

// Shared provider instance (both models use the same API key)
let mimoProvider: ReturnType<typeof createOpenAI> | null = null;

function getMimoProvider() {
  if (!mimoProvider) {
    mimoProvider = createOpenAI({
      baseURL: 'https://api.xiaomimimo.com/v1',
      apiKey: process.env.MIMO_API_KEY,
    });
  }
  return mimoProvider;
}

export function getModel(modelId: string): LanguageModel | null {
  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!model) return null;
  return getMimoProvider()(modelId);
}

/**
 * Create a model from user-provided BYOK credentials.
 * The provider instance is created fresh each time — never cached.
 */
export function getCustomModel(endpoint: string, apiKey: string, modelId: string): LanguageModel {
  const provider = createOpenAI({
    baseURL: endpoint.replace(/\/+$/, ''),
    apiKey,
  });
  return provider(modelId);
}

export function isValidModel(modelId: string): boolean {
  return AVAILABLE_MODELS.some(m => m.id === modelId);
}
