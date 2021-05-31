import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { MailRepository } from './MailRepository';
import { MailDelivery } from './MailDelivery';

import * as config from 'config';
const whitelistedAddresses = config.get<Array<string>>('mail.whitelist.addresses');

const mailRepository = new MailRepository();
const mailDelivery = new MailDelivery(mailRepository);

const server = new SMTPServer({
  authOptional: true,
  allowInsecureAuth: true,
  onMailFrom(address, session, cb) {
    cb();
  },
  onAuth(auth, session, callback) {
    console.log(`Denied SMTP login for user: ${auth.username}`);
    return callback(new Error('Invalid username or password'));
  },
  onData(stream, session, callback) {
    simpleParser(stream).then(
      mail => {
        mailDelivery.deliver(mail);
        callback();
      },
      callback,
    );
  },
  onRcptTo(address, session, callback) {
    if(!whitelistedAddresses.includes(address.address)) {
      console.log('Denied RCPT', address.address);
      return callback(
        new Error('Not allowed'),
      );
    }
    console.log('RCPT', address.address);
    return callback(); // Accept the address
  },
});

server.on('error', err => {
  console.error(err);
});

server.listen(config.get('smtp.port'));

// Require the framework and instantiate it
import fastify from 'fastify';

const apiServer = fastify({ logger: true });

apiServer.get<{
  Params: { address: string };
}>('/mail/:address', async request => {
  return mailRepository.getInbox(request.params.address);
});

apiServer.get<{
  Params: { address: string };
}>('/fetch/:address', async request => {
  const mails = mailRepository.getInbox(request.params.address);
  mailRepository.clearInbox(request.params.address);
  return mails;
});

const start = async (): Promise<void> => {
  try {
    await apiServer.listen(config.get('api.port'));
  } catch(err) {
    apiServer.log.error(err);
    process.exit(1);
  }
};
void start();
