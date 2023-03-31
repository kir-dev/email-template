import { existsSync, readFileSync } from 'fs';
import * as ejs from 'ejs';
import axios from 'axios';
import { Injectable } from '@nestjs/common';

interface SendMail {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface Setup {
  templateUrl: string;
  apiKey: string;
  mailServerUrl: string;
}

@Injectable()
export class MailingService {
  static template = '';
  static mailServerUrl = '';
  static apiKey = '';
  static setup({ templateUrl, mailServerUrl, apiKey }: Setup) {
    if (!existsSync(templateUrl)) throw new Error('Template not found');
    MailingService.template = readFileSync(templateUrl).toString();
    MailingService.apiKey = apiKey;
    MailingService.mailServerUrl = mailServerUrl;
  }
  generateMail(values: unknown) {
    return ejs.render(MailingService.template, values, { rmWhitespace: true });
  }
  sendMail(data: SendMail[]) {
    if (!MailingService.apiKey)
      throw 'API key is not provided for Mailing Service';
    if (!MailingService.mailServerUrl)
      throw 'Mail server URL is not provided for Mailing Service';
    return axios
      .post(MailingService.mailServerUrl, data, {
        headers: { 'X-Api-Key': MailingService.apiKey },
      })
      .then(() => true)
      .catch(() => false);
  }
}
