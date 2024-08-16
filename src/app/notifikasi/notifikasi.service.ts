import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';

// VAPID Keys from the previous step
const VAPID_PUBLIC_KEY = 'BHgzOwxa7wYgHIGB6dg32aixEA6I4tJjvBnxJVJ3al1sXeK3aRl6ctz62URdwOAwiYLuUs2Ol_5MzjLDHBhcIfQ';
const VAPID_PRIVATE_KEY = 'hsBt1f-hfFXcdDb9eVJnNCdZ8tIf17zno-ZgLc49NPQ';

webPush.setVapidDetails(
  'mailto:nayhan@example.com', // Replace with your email address
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

@Injectable()
export class NotifikasiService {
  private readonly logger = new Logger(NotifikasiService.name);

  async sendNotification(subscription: any, payload: any) {
    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
      this.logger.log(`Notification sent`);
    } catch (error) {
      this.logger.error('Error sending notification', error.stack);
    }
  }
  
}
