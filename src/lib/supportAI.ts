// Compatibility adapter for persisted support conversations. No provider or network calls.
import { localAnswer, companyFacts, fallback } from './localFaq';
export { companyFacts };
export { wantsHuman } from './supportIntent';
export type SupportMessage = {sender:string;body:string};
export type SupportFact = {id:string;text:string};
export const aiFallback = fallback;
export function verifiedFallback(history:SupportMessage[], _facts:SupportFact[]){return localAnswer(history.filter(m=>m.sender==='user').at(-1)?.body||'').text;}
export async function answerSupport(history:SupportMessage[], facts:SupportFact[], _requestFetch?:typeof fetch){return verifiedFallback(history,facts);}
