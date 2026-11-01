export type CannedReply = {
  id: string;
  title: string;
  body: string;
};

export const CANNED_REPLIES: CannedReply[] = [
  {
    id: 'calendar-reconnect',
    title: 'Reconnect calendar sync',
    body: 'Thanks for reaching out. When a calendar password changes, Tideline loses access to that calendar until the connection is renewed.\n\nTo reconnect, open Settings, then Calendars, choose the affected calendar and select Reconnect. Sign in again when prompted, and bookings made in the meantime will sync within a few minutes.',
  },
  {
    id: 'double-booking',
    title: 'Double booking apology',
    body: 'I am sorry about the double booking, I know how disruptive that is for your team and your clients.\n\nThis happens when a team calendar stops syncing, so Tideline cannot see the busy times. Once the calendar is reconnected from Settings, then Calendars, conflict checks pick up again and the same slot cannot be booked twice.',
  },
  {
    id: 'refund-policy',
    title: 'Refund policy',
    body: 'Thanks for letting us know. Annual plans can be refunded in full within 30 days of purchase, and monthly plans can be canceled at any time without further charges.\n\nOnce the refund is issued, it appears on your statement within 5 to 10 business days.',
  },
  {
    id: 'seat-count',
    title: 'Seat count on invoices',
    body: 'Your invoice counts every member with access to the workspace, including people who were invited but have not signed in yet.\n\nYou can review pending invitations under Settings, then Members. Removing the ones you no longer need lowers the seat count from your next invoice.',
  },
  {
    id: 'reminder-emails',
    title: 'Reminder emails not arriving',
    body: 'Sorry to hear reminders are not reaching your clients. First, check that reminders are turned on under Settings, then Notifications, and that the booking has a valid email address.\n\nReminders can also land in spam, so ask a client to check that folder. If they still do not arrive, send me a booking reference and I will trace the delivery.',
  },
  {
    id: 'feature-request',
    title: 'Feature request received',
    body: 'Thank you for the suggestion. I have shared it with our product team along with your use case, which helps them decide what to build next.\n\nI cannot promise a date, but I will update you here as soon as there is news.',
  },
  {
    id: 'closing-follow-up',
    title: 'Closing follow up',
    body: 'I wanted to check in on this. Since we have not heard back, I will close this ticket for now.\n\nIf anything comes up again, reply to this email and the ticket reopens with the full history.',
  },
  {
    id: 'sso-setup',
    title: 'SSO setup',
    body: 'Single sign on is available on the Business plan. You can set it up under Settings, then Security, where you will find the details to enter in your identity provider.\n\nOnce it is connected, members sign in with their work accounts.',
  },
];
