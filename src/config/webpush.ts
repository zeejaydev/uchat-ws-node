import webpush, { PushSubscription } from "web-push";

export default function setupWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export const sendPush = (message: string, sub: PushSubscription) => {
  webpush.sendNotification(
    sub,
    JSON.stringify({
      type: "receive-message",
      payload: {
        message: message,
      },
    })
  );
};
