export interface ISavedMail {
  receiveTimestamp: number;
  messageId?: string;
  date?: Date;
  senderAddress?: string;
  subject?: string;
  text?: string;
  html?: string;
}
