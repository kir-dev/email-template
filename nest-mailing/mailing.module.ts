import { Module } from '@nestjs/common';

import { MailingService, Setup } from './mailing.service';

@Module({})
export class MailingModule {
  static forRoot(config: Setup) {
    MailingService.setup(config);
    return {
      module: MailingModule,
      providers: [MailingService],
      exports: [MailingService],
    };
  }
}
