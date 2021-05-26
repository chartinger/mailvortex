import { ParsedMail } from "mailparser";

export class MailRepository {
  private max_inbox_size = 100;
  private inboxes: Map<string, Array<ParsedMail>> = new Map();

  public deliver(address: string, mail: ParsedMail) {
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

  public getInbox(address: string): Array<ParsedMail> {
    return this.inboxes.get(address) ?? [];
  }

  public clearInbox(address: string): void {
    this.inboxes.delete(address);
  }
}
