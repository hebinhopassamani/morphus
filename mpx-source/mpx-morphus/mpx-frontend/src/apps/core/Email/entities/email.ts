export interface EmailTo {
  id: string;
  mail: string;
  name?: string;
  emailId: string;
}

export interface EmailFrom {
  id: string;
  mail: string;
  name?: string;
  emailId: string;
}

export interface EmailCc {
  id: string;
  mail: string;
  name?: string;
  emailId: string;
}

export interface EmailBcc {
  id: string;
  mail: string;
  name?: string;
  emailId: string;
}

export interface Email {
  id: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  isHtmlBody: boolean;
  mailSent: boolean;

  emailTo?: EmailTo[];
  emailFrom?: EmailFrom[];
  emailCc?: EmailCc[];
  emailBcc?: EmailBcc[];
}
