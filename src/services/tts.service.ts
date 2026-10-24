import apiClient from './api';

export interface TtsVoice {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
}

export interface TtsUsageStats {
  charactersSynthesized: number;
  audiosGenerated: number;
  freeTierAllowanceRemaining: number;
  estimatedCostUsd: string;
  pricingModel: string;
  audioStorageBackend: string;
}

export const ttsService = {
  /**
   * Generate Google Cloud TTS audio for a lesson
   */
  async generateAudio(lessonId: string, voiceId?: string): Promise<any> {
    const response = await apiClient.post(`/tts/generate/${lessonId}`, { voiceId });
    return response.data;
  },

  /**
   * Force regenerate Google Cloud TTS audio with version increment
   */
  async regenerateAudio(lessonId: string, voiceId?: string): Promise<any> {
    const response = await apiClient.post(`/tts/regenerate/${lessonId}`, { voiceId });
    return response.data;
  },

  /**
   * Preview TTS audio for any given text snippet
   */
  async previewAudio(text: string, voiceId?: string): Promise<{ audioUrl: string; duration: number }> {
    const response = await apiClient.post('/tts/preview', { text, voiceId });
    return response.data;
  },

  /**
   * Get supported Google Cloud voices
   */
  async getVoices(): Promise<TtsVoice[]> {
    const response = await apiClient.get<TtsVoice[]>('/tts/voices');
    return response.data;
  },

  /**
   * Get usage monitoring and cost estimation
   */
  async getUsageStats(): Promise<TtsUsageStats> {
    const response = await apiClient.get<TtsUsageStats>('/tts/usage');
    return response.data;
  },
};

export default ttsService;
