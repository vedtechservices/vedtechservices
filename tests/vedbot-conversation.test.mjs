import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const seed = JSON.parse(fs.readFileSync('src/data/portfolio-seed.json', 'utf8'));
function load(file) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: (n) =>
        n === './businessKnowledge'
          ? load('src/lib/businessKnowledge.ts')
          : n === '../data/portfolio-seed.json'
            ? seed
            : (() => {
                throw Error('Unexpected dependency: ' + n);
              })(),
      fetch: () => {
        throw Error('Network forbidden');
      },
    },
  );
  return exports;
}
const bot = load('src/lib/localFaq.ts'),
  kb = load('src/lib/businessKnowledge.ts');
for (const q of ['hii', 'hlo', 'hello', 'hey', 'Namaste!!!', 'नमस'])
  test('greeting ' + q, () => assert.equal(bot.localAnswer(q).intent, 'greeting'));
for (const [q, intent] of [
  ['servies!!!', 'services'],
  ['kitna cost hai?', 'pricing'],
  ['mujhe webiste chahiye', 'discovery'],
  ['your process', 'process'],
  ['technology stack', 'technology'],
  ['about you', 'company'],
  ['helpdesk', 'support'],
  ['services pricing', 'clarify'],
  ['what is the weather?', 'fallback'],
])
  test(q, () => assert.equal(bot.localAnswer(q).intent, intent));
function conversation() {
  let state = bot.initialState();
  return (q) => {
    const result = bot.respond(q, state);
    state = result.state;
    return result;
  };
}
test('website discovery remembers business and requested booking without inventing capability', () => {
  const say = conversation();
  assert.match(say('I need a website').text, /business/);
  assert.match(say('Travel').text, /features/);
  const features = say('Booking system');
  assert.equal(features.state.project.industry, 'Travel');
  assert.equal(features.state.project.features, 'Booking system');
  assert.match(features.text, /confirm feasibility/);
  const price = say('How much?');
  assert.equal(price.intent, 'pricing');
  assert.doesNotMatch(price.text, /₹|guarantee|\b\d{3,}\b/);
  assert.equal(price.state.pending, undefined);
});
test('skip, acknowledgements, summary, corrections, reset', () => {
  const say = conversation();
  say('I need a website');
  assert.match(say('yes').text, /business/);
  say('Travel');
  say('Booking system');
  assert.match(say('skip').text, /timeline/);
  const end = say('next month');
  assert.equal(end.state.pending, undefined);
  assert.match(end.text, /budget: Skipped/);
  assert.match(say('change industry to retail').text, /industry: retail/);
  assert.match(say('summary').text, /features: Booking system/);
  const reset = say('reset');
  assert.equal(Object.keys(reset.state.project).length, 0);
  assert.equal(reset.state.answered.length, 0);
});
test('topic switches and no stop discovery from consuming unrelated replies', () => {
  const say = conversation();
  say('I need a website');
  say('contact');
  assert.equal(say('Travel').intent, 'fallback');
  say('I need a website');
  say('no');
  assert.equal(say('Travel').intent, 'fallback');
});
test('followup uses current topic only', () => {
  const say = conversation();
  say('network');
  assert.match(say('tell me more').text, /LAN/);
  say('pricing');
  assert.doesNotMatch(say('tell me more').text, /LAN/);
});
test('personal information is not retained', () => {
  const say = conversation();
  say('I need a website');
  const r = say('person@example.com');
  assert.equal(r.intent, 'privacy');
  assert.equal(r.state.project.industry, undefined);
  assert.doesNotMatch(JSON.stringify(bot.appendQuestion([], 'person@example.com')), /person@example/);
});
test('portfolio uses shared data and handles empty data safely', () => {
  const result = kb.portfolioAnswer();
  for (const p of seed.filter((p) => p.surfaces.includes('portfolio'))) assert.ok(result.includes(p.title));
  assert.match(kb.portfolioAnswer([]), /No project details/);
  assert.match(
    kb.portfolioAnswer([
      { title: 'Changed live source', description: 'Verified description', surfaces: ['portfolio'] },
    ]),
    /Changed live source/,
  );
});
test('verified facts, fallback, bounded state and local dependency graph', () => {
  assert.match(bot.localAnswer('contact').text, /7858971869/);
  assert.match(bot.localAnswer('unknown thing').text, /\/contact/);
  for (const file of [
    'src/lib/localFaq.ts',
    'src/lib/businessKnowledge.ts',
    'src/components/common/ChatBot.tsx',
  ])
    assert.doesNotMatch(
      fs.readFileSync(file, 'utf8'),
      /fetch\s*\(|axios|supabase|localStorage|sessionStorage|dangerouslySetInnerHTML|https:\/\/api\./i,
    );
  const say = conversation();
  for (let i = 0; i < 150; i++) say('hello');
  assert.ok(say('services').state.answered.length <= 40);
});

test('expanded Hinglish, typo support and confidence are deterministic', () => {
  for (const [q, intent] of [
    ['aap kya karte ho', 'services'],
    ['kya services hai', 'services'],
    ['softwere', 'software'],
    ['suport ticket', 'support'],
    ['contect', 'contact'],
    ['help chahiye', 'support'],
  ])
    assert.equal(bot.localAnswer(q).intent, intent, q);
  assert.ok(bot.analyzeIntent('services').confidence > bot.analyzeIntent('services pricing').confidence);
  assert.equal(bot.analyzeIntent('services pricing').intent, 'clarify');
});
test('repeat greetings and unknowns offer concise next steps without repeated introductions', () => {
  const say = conversation();
  say('hello');
  assert.doesNotMatch(say('hello').text, /not generative AI/);
  say('unknown question');
  assert.match(say('another unknown question').text, /support request/);
});
test('shared current project snapshot overrides local seed without network in the engine', () => {
  const reply = bot.respond('portfolio', bot.initialState(), [
    { title: 'New shared project', description: 'Actual public description', surfaces: ['portfolio'] },
  ]);
  assert.match(reply.text, /New shared project/);
  assert.doesNotMatch(reply.text, /Retail Chain/);
  assert.match(bot.respond('portfolio', bot.initialState(), []).text, /No project details/);
  assert.ok(fs.readFileSync('src/components/common/ChatBot.tsx', 'utf8').includes('rawProjects'));
});
test('discovery accepts service answer and explicit natural correction', () => {
  const say = conversation();
  say('plan a project');
  assert.match(say('website').text, /business/);
  say('travel');
  assert.match(say('actually industry is retail').text, /industry: retail/);
});

test('selected Hindi business phrases normalize into verified intents',()=>{
 for(const [q,intent] of [['\u0938\u0902\u092a\u0930\u094d\u0915','contact'],['\u0915\u0940\u092e\u0924','pricing'],['\u092e\u0926\u0926','support'],['\u0935\u0947\u092c\u0938\u093e\u0907\u091f','software'],['\u0906\u092a \u0915\u094d\u092f\u093e \u0915\u0930\u0924\u0947 \u0939\u094b','services']])assert.equal(bot.localAnswer(q).intent,intent,q);
});
