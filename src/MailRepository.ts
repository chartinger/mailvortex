import { ISavedMail } from './SavedMail';

export class MailRepository {
  private max_inbox_size = 100;
  private inboxes: Map<string, Array<ISavedMail>> = new Map();

  public deliver(address: string, mail: ISavedMail): void {
    let inbox = this.inboxes.get(address);
    if(inbox == null) {
      inbox = [];
      this.inboxes.set(address, inbox);
    }
    inbox.push(mail);
    if(inbox.length > this.max_inbox_size) {
      inbox.length = this.max_inbox_size;
    }
    console.log(`Delivered mail to ${address}, total mails: ${inbox.length}`);
  }

  public getInbox(address: string): Array<ISavedMail> {
    return this.inboxes.get(address) ?? [];
  }

  public clearInbox(address: string): void {
    this.inboxes.delete(address);
  }
}
