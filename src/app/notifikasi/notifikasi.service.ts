import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';

interface CustomPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}


@Injectable()
export class PushNotificationService {
  async sendNotification(subscription: CustomPushSubscription, payload: { title: string; body: string }) {
    const pushOptions = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    // const webpush = require('web-push');
    webPush.setVapidDetails(
      'mailto:youremail@example.com',
      'BEUDgYgPMim27rsp3fORWHlQEaJkkVJYYkg-ooj-8frnDfslIOdLmMBeKAsAEMum43RR053O7U3ic6Pa0vp1knY',
      '3vSGvLPJZQGMz2a1ou5qPqbU4popwcwrX8tYFjGfelM',
    );

    try {
      await webPush.sendNotification(pushOptions, JSON.stringify(payload));
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

