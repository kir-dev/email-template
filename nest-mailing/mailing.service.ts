import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';

import { MailingModule } from './mailing.module';

type Templates = Record<string, string> & { default: string };

interface SendMail {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface Setup {
  templates: Templates;
  apiKey: string;
  mailServerUrl: string;
}

class SetupIncompleteException extends Error {
  message = `You need to set up ${MailingService.name} through ${MailingModule.name} in order to properly use it!`;
}

class TemplateNotFoundException extends Error {
  constructor(templateName: string) {
    super(`Template "${templateName}" not found. Check the setup process!`);
  }
}

@Injectable()
export class MailingService {
  static templates: Templates = { default: '' };
  static mailServerUrl = '';
  static apiKey = '';
  static setupComplete = false;

  /**
   * Sets up everything for MailingService. This reads in all the templates in order to speed up sending and to check if the files exist.
   * @param templates - Object in which the keys are the names of the template and the value is the path of the template.
   * @param mailServerUrl - The endpoint of the service which will handle the delivery of the e-mail.
   * @param apiKey - The API key for the server (X-Api-Key value).
   */
  static setup({ templates, mailServerUrl, apiKey }: Setup) {
    MailingService.templates = Object.entries(templates).reduce(
      (accumulator: Templates, [name, path]) => {
        if (!existsSync(path))
          throw new Error('Template not found for ' + name);
        accumulator[name] = readFileSync(path).toString();
        return accumulator;
      },
      { default: readFileSync(templates.default).toString() },
    );
    if (!apiKey) throw 'API key is not provided for Mailing Service';
    if (!mailServerUrl)
      throw 'Mail server URL is not provided for Mailing Service';
    MailingService.apiKey = apiKey;
    MailingService.mailServerUrl = mailServerUrl;
    MailingService.setupComplete = true;
    Logger.log(
      `Loaded ${Object.keys(templates).length} e-mail template(s)`,
      this.name,
    );
  }

  /**
   * Generates an HTML code for the given template filled in with values you provide.
   * @param values - The values you might refer to in your EJS file. This is not type checked!
   * @param templateName - One of the template names you provided during the setup process.
   */
  generateMail(
    values: unknown,
    templateName: keyof typeof MailingService.templates = 'default',
  ) {
    MailingService.checkSetup();

    const template = MailingService.templates[templateName];
    if (!template) throw new TemplateNotFoundException(templateName);

    return ejs.render(MailingService.templates[templateName], values);
  }

  /**
   * Sends a mail through the mailing delivery service provided in the setup process.
   * @param {SendMail[]} data - Array of objects containing to, from, subject and html string fields.
   */
  sendMail(data: SendMail[]) {
    MailingService.checkSetup();
    return axios
      .post(MailingService.mailServerUrl, data, {
        headers: { 'X-Api-Key': MailingService.apiKey },
      })
      .then(() => true)
      .catch(() => false);
  }

  private static checkSetup() {
    if (!MailingService.setupComplete) throw new SetupIncompleteException();
  }
}
