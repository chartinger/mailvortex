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
    console.log(`SMTP login for user: ${auth.username}`);
    callback(null, {
      user: auth.username,
    });
  },
  onData(stream, session, callback) {
    simpleParser(stream).then(
      mail => {
        mailDelivery.deliver(mail);
        console.info('++');
        console.info(decodeURI(decodeURIComponent(mail.text ?? '')));
        console.info('++');
        callback();
      },
      callback,
    );
  },
  onRcptTo(address, session, callback) {
    console.log('RCPT', address.address);
    if(!whitelistedAddresses.includes(address.address)) {
      return callback(
        new Error('Not allowed'),
      );
    }
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
