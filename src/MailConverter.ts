import { ParsedMail } from 'mailparser';
import { ISavedMail } from './SavedMail';

export class MailConverter {
  public convert(mail: ParsedMail): ISavedMail {
    return {
      receiveTimestamp: Date.now(),
      date: mail.date,
      messageId: mail.messageId,
      subject: mail.subject,
      senderAddress: mail.from?.value[0].address,
      text: mail.text,
      html: mail.textAsHtml,
    };
  }
}