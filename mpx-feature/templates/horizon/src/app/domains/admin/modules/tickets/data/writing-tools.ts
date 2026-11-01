export type Tone = {
  id: string;
  label: string;
  icon: string;
  opening: string;
  closing: string;
  fallback: string;
};

export type WritingTool = {
  id: string;
  label: string;
  icon: string;
};

export const TONES: Tone[] = [
  {
    id: 'friendly',
    label: 'Friendly',
    icon: 'heart',
    opening: 'Thanks so much for reaching out, happy to help!',
    closing: 'Let me know if anything else comes up. Have a great day,',
    fallback:
      "I'm looking into this right now and I'll follow up as soon as I know more.",
  },
  {
    id: 'professional',
    label: 'Professional',
    icon: 'briefcase-business',
    opening: 'Thank you for contacting us about this.',
    closing:
      'Please let us know if you have any further questions. Best regards,',
    fallback:
      'We are reviewing the details and will follow up with next steps shortly.',
  },
  {
    id: 'apologetic',
    label: 'Apologetic',
    icon: 'hand-heart',
    opening:
      "I'm really sorry for the trouble this has caused, and thank you for your patience.",
    closing: 'Thanks again for bearing with us,',
    fallback:
      "I'm making this a priority and I'll update you as soon as it's resolved.",
  },
  {
    id: 'firm',
    label: 'Firm',
    icon: 'shield',
    opening:
      'Thanks for your message. I want to be clear about where things stand.',
    closing:
      'If you have new information to share, reply here and we will take another look. Regards,',
    fallback:
      'We have reviewed your request carefully, and our position on this has not changed.',
  },
];

export const WRITING_TOOLS: WritingTool[] = [
  {
    id: 'fix-grammar',
    label: 'Fix grammar',
    icon: 'spell-check',
  },
  {
    id: 'polish',
    label: 'Polish',
    icon: 'wand-sparkles',
  },
  {
    id: 'rewrite',
    label: 'Rewrite',
    icon: 'refresh-cw',
  },
  {
    id: 'shorten',
    label: 'Shorten',
    icon: 'shrink',
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: 'expand',
  },
];
