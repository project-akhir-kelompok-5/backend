import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import * as dotenv from 'dotenv';
  dotenv.config();
  
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST, //sesuaikan konfigurasi
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER, //sesuaikan user
          pass: process.env.MAIL_PASS, //sesuaikan password
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'), // template akan di ambil dari handlebar yang ada pada folder templates
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

// var transport = nodemailer.createTransport({
//   host: 'sandbox.smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: 'aaba9c29b2048e',
//     pass: 'a7be188ee42f88',
//   },
// });
