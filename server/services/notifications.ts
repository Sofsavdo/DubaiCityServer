export interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // Placeholder: integrate real provider (e.g., SendGrid/Mailgun)
  console.log('📧 sendEmail:', payload);
}

export async function sendSMS(payload: SmsPayload): Promise<void> {
  // Placeholder: integrate real provider (e.g., Twilio)
  console.log('📱 sendSMS:', payload);
}


