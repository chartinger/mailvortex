import { ParsedMail } from 'mailparser';
import { MailRepository } from './MailRepository';

import * as config from 'config';

const splitterAddresses = config.get<Array<string>>('mail.splitterAddresses');

export class MailDelivery {
  constructor(private mailRepository: MailRepository) {}

  public deliver(mail: ParsedMail): void {
    let receiver = mail.to;
    if(receiver != null) {
      if(!Array.isArray(receiver)) receiver = [receiver];
      for(const mailTo of receiver) {
        for(const address of mailTo.value) {
          if(address.address) {
            this.deliverInternal(address.address, mail);
          }
        }
      }
    }
  }

  public deliverInternal(address: string, mail: ParsedMail): void {
    if(splitterAddresses.includes(address)) {
      const mailBody = mail.text ?? '';
      const matches = mailBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
      if(matches == null) {
        this.mailRepository.deliver(address, mail);
      } else {
        const uniqueMathes = [...new Set(matches)];
        for(const match of uniqueMathes) {
          this.mailRepository.deliver(match, mail);
        }
      }
    } else {
      this.mailRepository.deliver(address, mail);
    }
  }
}
