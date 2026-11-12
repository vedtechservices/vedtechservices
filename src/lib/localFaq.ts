import { type PublicProject, knowledge, portfolioAnswer } from './businessKnowledge';
export const companyFacts = [
  {
    id: 'services',
    text: 'VedTech Services offers websites, mobile apps, custom software, cloud solutions, hardware repair, networking and IT maintenance. Which service interests you?',
  },
  {
    id: 'hardware',
    text: 'Hardware services include laptop and desktop repair, printer setup, upgrades and office IT infrastructure. Do not share passwords or access codes.',
  },
  {
    id: 'software',
    text: 'Software services include websites, web applications, mobile apps, custom business software and maintenance. The team can confirm scope at /contact.',
  },
  {
    id: 'network',
    text: 'Networking services include LAN/WAN, Wi-Fi, router configuration and firewall setup.',
  },
  ...Object.entries(knowledge).map(([id, entry]) => ({ id, text: entry.text })),
];
export const suggestedQuestions = [
  'What services do you offer?',
  'I need a website',
  'Show your portfolio',
  'How can I contact you?',
];
export const greeting =
  'Hi! I’m VedBot, VedTech’s local business assistant. I can help with services, project examples, pricing guidance or a project brief. I use website information and local rules, not generative AI. What would you like help with?';
export const fallback =
  'I don’t have a verified answer for that. I can help with services, pricing, portfolio or project planning. For other questions, visit /contact. You can also choose Create/check support request to review and submit an issue. Support submission needs the website backend; nothing has been submitted by this reply.';
const aliases: Record<string, string> = {
  hii: 'hi',
  hiii: 'hi',
  hlo: 'hello',
  helo: 'hello',
  helllo: 'hello',
  servies: 'services',
  servces: 'services',
  prcing: 'pricing',
  prise: 'price',
  protfolio: 'portfolio',
  portoflio: 'portfolio',
  contat: 'contact',
  webiste: 'website',
  websiet: 'website',
  softwere: 'software',
  suport: 'support',
  contect: 'contact',
  pricng: 'pricing',
  namstey: 'namaste',
  shukria: 'shukriya',
};
export function normalize(input: string) {
  return input
    .slice(0, 4000)
    .normalize('NFKC')
    .toLowerCase()
    .replace(
      /\u0906\u092a \u0915\u094d\u092f\u093e \u0915\u0930\u0924\u0947 \u0939\u094b|aap kya karte ho|kya services hai|kya karte ho/g,
      ' services ',
    )
    .replace(/\u0935\u0947\u092c\u0938\u093e\u0907\u091f/g, ' website ')
    .replace(/\u0915\u0940\u092e\u0924|\u0926\u093e\u092e/g, ' price ')
    .replace(/\u0938\u0902\u092a\u0930\u094d\u0915/g, ' contact ')
    .replace(/\u092e\u0926\u0926/g, ' support ')
    .replace(/dhanyawaad/g, 'dhanyavad')
    .replace(/wi[ -]?fi/g, 'wifi')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => aliases[w] || w)
    .join(' ');
}
const rules: Record<string, Array<[string, number]>> = {
  human: [
    ['human', 4],
    ['agent', 4],
    ['person', 3],
  ],
  pricing: [
    ['pricing', 4],
    ['price', 4],
    ['cost', 4],
    ['quote', 4],
    ['how much', 5],
    ['kitna', 4],
    ['kimat', 4],
    ['कतन', 4],
    ['amc', 3],
  ],
  portfolio: [
    ['portfolio', 5],
    ['projects', 3],
    ['examples', 4],
    ['demo', 4],
    ['your work', 5],
  ],
  contact: [
    ['contact', 4],
    ['email', 4],
    ['phone', 4],
    ['address', 4],
    ['location', 4],
    ['sampark', 4],
  ],
  hardware: [
    ['laptop', 4],
    ['desktop', 4],
    ['hardware', 4],
    ['printer', 4],
    ['repair', 3],
  ],
  network: [
    ['network', 4],
    ['wifi', 4],
    ['router', 4],
    ['firewall', 4],
    ['lan', 4],
  ],
  software: [
    ['website', 4],
    ['software', 4],
    ['mobile', 4],
    ['app', 3],
    ['cloud', 4],
    ['development', 3],
  ],
  services: [
    ['services', 4],
    ['service', 3],
    ['offer', 3],
    ['seva', 4],
  ],
  company: [
    ['company', 4],
    ['about you', 5],
    ['who are you', 5],
    ['vedtech', 3],
  ],
  process: [
    ['process', 4],
    ['steps', 4],
    ['how do you build', 5],
  ],
  technology: [
    ['technologies', 4],
    ['technology', 4],
    ['stack', 4],
    ['react', 3],
  ],
  support: [
    ['support', 4],
    ['issue', 3],
    ['helpdesk', 4],
    ['ticket', 5],
    ['request support', 6],
    ['help chahiye', 5],
  ],
};
export function analyzeIntent(input: string) {
  const text = normalize(input);
  const ranked = Object.entries(rules)
    .map(([intent, terms]) => ({
      intent,
      score: terms.reduce(
        (sum, [term, weight]) => sum + ((' ' + text + ' ').includes(' ' + term + ' ') ? weight : 0),
        0,
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return { intent: 'fallback', confidence: 0 };
  const confidence = ranked[0].score / (ranked[0].score + (ranked[1]?.score || 0) + 1);
  return { intent: ranked[0].score < 3 || confidence < 0.55 ? 'clarify' : ranked[0].intent, confidence };
}
export function recognize(input: string) {
  return analyzeIntent(input).intent;
}
export type Field = 'service' | 'industry' | 'features' | 'budget' | 'timeline';
const fields: Field[] = ['service', 'industry', 'features', 'budget', 'timeline'];
const questions: Record<Field, string> = {
  service: 'What kind of project or service do you need?',
  industry: 'What kind of business is it for?',
  features: 'Which features would you like? I’ll record requirements for the team to confirm.',
  budget: 'Do you have a budget range? This is optional; say skip.',
  timeline: 'Do you have a target timeline? This is optional; say skip.',
};
export type ConversationState = {
  topic?: string;
  answered: string[];
  project: Partial<Record<Field, string>>;
  pending?: Field;
  discovering: boolean;
  turn: number;
  fallbackCount?: number;
};
export const initialState = (): ConversationState => ({
  answered: [],
  project: {},
  discovering: false,
  turn: 0,
});
export function projectSummary(state: ConversationState) {
  return (
    'Project brief (requirements only; scope, price and dates are unconfirmed)\n' +
    fields.map((f) => `${f}: ${state.project[f] || 'Not provided'}`).join('\n') +
    '\nNext step: edit/copy this brief and use /contact. Nothing has been submitted.'
  );
}
export function respond(
  input: string,
  previous: ConversationState = initialState(),
  projects?: PublicProject[],
): {
  intent: string;
  text: string;
  state: ConversationState;
} {
  const text = normalize(input),
    state: ConversationState = {
      ...previous,
      project: { ...previous.project },
      answered: [...previous.answered],
      turn: previous.turn + 1,
    };
  const reply = (intent: string, body: string) => {
    if (!state.answered.includes(intent)) state.answered.push(intent);
    state.answered = state.answered.slice(-40);
    state.fallbackCount = intent === 'fallback' ? (previous.fallbackCount || 0) + 1 : 0;
    return { intent, text: body, state };
  };
  if (/^(reset|restart|start over|clear conversation)$/.test(text))
    return { intent: 'reset', text: greeting, state: initialState() };
  // Personal information is never placed in discovery fields or the transcript by the UI.
  if (
    /\b[^\s@]+@[^\s@]+\.[^\s@]+\b|(?:\+?\d[\s()-]*){9,}|\b(password|credit card|aadhaar|aadhar)\b/i.test(
      input,
    )
  )
    return reply(
      'privacy',
      'Please leave personal or sensitive details out of this chat. I don’t need them for a project brief. Use /contact if you choose to share details with the team; nothing has been submitted.',
    );
  if (/^(hi|hello|hey|namaste|namaskar|नमस|good morning|good evening)( there| vedbot)?$/.test(text))
    return reply(
      'greeting',
      previous.answered.includes('greeting') ? 'Hi again! What would you like help with?' : greeting,
    );
  if (/^(thanks|thank you|thankyou|shukriya|dhanyavad|धनवद)( a lot)?$/.test(text))
    return reply('thanks', 'You’re welcome! Let me know if you need anything else.');
  if (/^(bye|goodbye|see you|alvida)$/.test(text)) {
    state.pending = undefined;
    state.discovering = false;
    return reply('goodbye', 'Thanks for visiting VedTech. Take care!');
  }
  if (/^(summary|project summary|brief|show summary)$/.test(text))
    return reply('summary', projectSummary(state));
  const correction = text.match(
    /^(?:(?:actually )?(?:change|correct|update) |actually )(service|industry|features|budget|timeline)(?: to| is)? (.+)$/,
  );
  if (correction) {
    const field = correction[1] as Field;
    state.project[field] = correction[2];
    if (state.pending === field)
      state.pending = state.discovering ? fields.find((f) => !state.project[f]) : undefined;
    return reply('correction', `Updated ${field}.\n${projectSummary(state)}`);
  }
  if (/^(no|nahi|nahin|नह|stop|cancel)$/.test(text)) {
    state.pending = undefined;
    state.discovering = false;
    return reply(
      'no',
      'Okay, project questions are paused. You can ask another question or request your summary.',
    );
  }
  if (/^(yes|yeah|yep|haan|han|ह|ok|okay|sure|continue)$/.test(text))
    return reply(
      'acknowledgement',
      state.pending
        ? questions[state.pending]
        : 'Sure. Would you like services, portfolio examples, pricing guidance or a project brief?',
    );
  const start = /\b(i need|i want|build me|looking for|mujhe|chahiye|project brief|plan a project)\b/.test(
    text,
  );
  const intent = recognize(input);
  if (start && (intent === 'software' || /project brief|plan a project/.test(text))) {
    state.discovering = true;
    state.topic = 'project';
    if (intent === 'software') state.project.service = text;
    state.pending = fields.find((f) => !state.project[f]);
    return reply(
      'discovery',
      `Let’s outline your requirements without personal details. You can skip any question or use “change industry to …”. This brief stays in memory and clears on reload.\n${state.pending ? questions[state.pending] : projectSummary(state)}`,
    );
  }
  const skip = /^(skip|pass|prefer not to say)$/.test(text);
  if (
    state.pending &&
    (intent === 'fallback' ||
      skip ||
      (state.pending === 'service' && ['software', 'hardware', 'network'].includes(intent))) &&
    !/[?]/.test(input) &&
    !/^(what|why|how|when|where|can you|do you)\b/.test(text)
  ) {
    const field = state.pending;
    state.project[field] = skip ? 'Skipped' : input.trim().slice(0, 500);
    state.pending = fields.find((f) => !state.project[f]);
    const note =
      field === 'features' && !skip
        ? 'I’ve recorded those as requested features. The team must confirm feasibility and scope.\n'
        : '';
    return reply('discovery', note + (state.pending ? questions[state.pending] : projectSummary(state)));
  }
  if (/^(what about that|tell me more|and that|more details|aur batao|iske bare mein batao)$/.test(text))
    return reply(
      'followup',
      state.topic && state.topic !== 'project'
        ? companyFacts.find((f) => f.id === state.topic)?.text ||
            'Please explore /portfolio for the full examples.'
        : 'Which service or topic would you like more detail about?',
    );
  if (intent !== 'fallback' && intent !== 'clarify') {
    state.topic = intent;
    state.pending = undefined;
    state.discovering = false;
  }
  if (intent === 'portfolio') return reply(intent, portfolioAnswer(projects));
  if (intent === 'human' || intent === 'support')
    return reply(
      intent,
      'No human agent is connected here. Choose Create/check support request to review your issue and contact details, then confirm submission. You can also visit /support. Saving a request needs the website backend; this reply has submitted nothing.',
    );
  if (intent === 'clarify')
    return reply(intent, 'Which topic should we start with: services, pricing, portfolio or contact?');
  return reply(
    intent,
    companyFacts.find((f) => f.id === intent)?.text ||
      ((previous.fallbackCount || 0) > 0
        ? 'I still do not have verified information for that. Which would help: services, pricing or a support request? Use Create/check support request, /support or /contact. Nothing has been submitted.'
        : fallback),
  );
}
export function localAnswer(input: string) {
  const { intent, text } = respond(input);
  return { intent, text };
}
export type FaqMessage = {
  sender: 'user' | 'faq';
  body: string;
};
export const initialConversation = (): FaqMessage[] => [{ sender: 'faq', body: greeting }];
export function appendQuestion(messages: FaqMessage[], question: string): FaqMessage[] {
  const answer = localAnswer(question);
  return answer.intent === 'reset'
    ? initialConversation()
    : [
        ...messages.slice(-98),
        {
          sender: 'user',
          body: answer.intent === 'privacy' ? '[Personal details omitted]' : question.slice(0, 4000),
        },
        { sender: 'faq', body: answer.text },
      ];
}

export function suggestionsFor(state: ConversationState): string[] {
  if (state.pending) return ['skip', 'summary', 'cancel'];
  if (state.topic === 'pricing') return ['What is your process?', 'How can I contact you?', 'I need support'];
  if (state.topic === 'software' || state.topic === 'portfolio')
    return ['I need a website', 'How much does it cost?', 'What technologies do you use?'];
  if (state.topic === 'support' || state.fallbackCount)
    return ['I need support', 'What services do you offer?', 'How can I contact you?'];
  return suggestedQuestions;
}
