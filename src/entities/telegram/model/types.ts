export interface TelegramUser {
  chatId: number;
  userId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  isSubscribed: boolean;
}

export interface TelegramBotMessage {
  chatId: number;
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
}

export interface WebhookPayload {
  updateId: number;
  message?: {
    from: TelegramUser;
    text: string;
    chat: { id: number };
  };
}

export interface TelegramSyncConfig {
  botToken: string;
  webhookUrl: string;
  notifyOnCritical: boolean;
  dailyReportTime: string;
}
