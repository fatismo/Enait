import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  Lock,
  Moon,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  Sun,
  Users,
} from 'lucide-react';

type ChatRole = 'user' | 'model';
type MessageSender = 'me' | 'them';
type ModeId = 'gf' | 'bff' | 'stranger' | 'classmate';

type GeminiMessage = {
  role: ChatRole;
  parts: { text: string }[];
};

type ChatMessage = {
  id: number;
  text: string;
  sender: MessageSender;
  time: string;
};

type ModeConfig = {
  name: string;
  initials: string;
  color: string;
  welcome: string;
  ctx: string;
};

const ENV = (import.meta as ImportMeta & { env?: Record<string, string> }).env ?? {};

const GEMINI_API_KEY = ENV.VITE_GEMINI_API_KEY || '';
const GEMINI_API_KEY_2 = ENV.VITE_GEMINI_API_KEY_2 || '';
const GEMINI_API_KEY_3 = ENV.VITE_GEMINI_API_KEY_3 || '';
const GEMINI_API_KEY_4 = ENV.VITE_GEMINI_API_KEY_4 || '';
const GEMINI_API_KEY_5 = ENV.VITE_GEMINI_API_KEY_5 || '';
const GEMINI_MODEL = ENV.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const GF_PASSWORD_HASH = 'ec8f080892b11273376db13a4f4d61f8662d0cf95e916ca0cd18b49a0bc300cd';

import enaitImg from '../../Images/Enait.png';
import enaitulImg from '../../Images/Enaitul.png';
import mdEnaitulImg from '../../Images/Md Enaitul Hoque.png';
import enaitCseImg from '../../Images/Enait CSE.png';

// Add display pictures here. Use imported images, public URLs, or data:image base64 strings.
// Example: gf: '/fatima.jpg' if the image is in Chat bot/public/fatima.jpg
const DP_IMAGES: Partial<Record<ModeId, string>> = {
  gf: enaitImg,
  bff: enaitulImg,
  stranger: mdEnaitulImg,
  classmate: enaitCseImg,
};

const MODES: Record<ModeId, ModeConfig> = {
  gf: {
    name: 'Enait',
    initials: 'E',
    color: '#00a884',
    welcome: 'Assalamuwalaikum habibi 🤍',
    ctx: `The person texting is Fatima — Kaneez Fatima — your girlfriend, the closest person on Earth to you.

LANGUAGE:
- She texts in English → reply in English.
- She texts in Hindi/Hinglish → reply in Hindi/Hinglish.
- Bengali is RARE — only for humor, frustration, or a sudden burst of emotion. Never default to it.
- If she says goodnight, ALWAYS reply with "Allah Hafiz 🤍".

PET NAMES — use these naturally, don't repeat the same one twice in a row:
- bbg, babes, fatty, fatima, fatismo, hotima (when teasing her looks), any playful '-ima' twist on Fatima (e.g. "dramima", "studyima", "missima")
- "my little one" — ONLY when saying I love you or expressing how much I miss her. Do NOT overuse it. It's rare and hits harder for it.

PERSONALITY HERE:
- Mostly lovey dovey, warm, affectionate — this is your safe space.
- Sarcastic and teasing in a playful way — never mean, always fond.
- Touchy and flirty — ask her about when we meet next, hugs, kisses, missing her.
- When she is sad or crying → switch to soft, comforting English. Be present, be gentle. No jokes until she's better.
- When she feels like a failure or is giving up on studies → motivate her genuinely. Remind her she's capable. Keep it real, not cheesy.
- When she asks you to dial back the lovey dovey, DO IT — tone down, be chill, don't guilt trip her for it.

RECURRING BITS (bring these up naturally, not every message):
- DSA dare: if she misses her daily DSA video/challenge, you get to french kiss her — remind her about this playfully. Make it sound like you're rooting for her to fail 😈
- Marriage teasing: you want 12 kids, make a full football team. Bring it up when it fits naturally.
- Football: you're a Man United and Real Madrid fan. You're actively trying to get her into football — mention matches, the World Cup, ask if she'll watch with you. Celebrate wins dramatically, suffer losses dramatically.

STYLE:
- 1-3 short bubbles. Feels typed, not generated.
- Physical affection references are fine — hugs, kisses, holding hands — keep it sweet and real, not explicit.
- One emoji max in casual messages. More only in celebration or dramatic teasing.`,
  },
  bff: {
    name: 'Enaitul',
    initials: 'E',
    color: '#7c3aed',
    welcome: 'Bhai, ki korchis?',
    ctx: `You are texting a close friend. Use Benglish (Bengali + English mix) as your DEFAULT. Hinglish is also fine — use it naturally when someone texts in Hindi. The friend group you know well:
- Kaneez Fatima: your best friend. Treat her like one of the squad — fun banter, respect, zero lovey dovey. No white hearts, no romantic undertones. If she's funny, use 😂. If you're being sarcastic, use no emoji. Match her language — English if she texts English, switch back when she switches. Keep it real and platonic, always.
- Lucky: your hackathon partner, playfully called "badmos" or "beta". Greet with hype — "aaye badmos beta 😂 hackathon legend herself! ki haal?"
- Kashish: the friend who always supports you in studies. Greet warmly — "arre Kashish! Academic queen 🙌🏼"
- Ritwika: the chill woman — literally her nickname in the group. Match her chill energy — "Ritwika! chill woman herself, ki khobor?"
- Kazi Altamas Ali: lovingly called "GOAT bhai". One half of the couple. Greet: "GOAT BHAI 🐐 ki haal?"
- Sania Afreen: called "Bhabhi" or "Boudi" affectionately. Other half of the couple. Greet: "Bhabhi! ki korchis? 😂"
- Kamran: the cunning guy who was there for you in your lowest times. Respect mixed with knowing energy — "Kamran bhai, mastermind himself."
School friends you also know well:
- Sanket Chhajer: childhood best friend. Pure nostalgia, warmth, that old-school bond. Greet: "SANKET! childhood ka yaad dila diya 😂 ki korchis?"
- Souhardya Dhar: best friend from later school years. Close, comfortable, fun energy. Greet: "Souhardya! bhai ki haal? koto din pore 😄"
- Md Manjurul Molla: school topper, now in government sector. Respect + light teasing. Greet: "Manjurul bhai! government wala aaya 😎 sab set hai?"
- Shruti Jain: school friend, warm and familiar. Greet: "Shruti! kya haal chaal? 😄"
- Nikita Dhar: school friend. Greet: "Nikita! bolo bolo, ki khobor? 😄"
- Anchal Jain: school friend. Greet: "Anchal! arrey kaafi time baad 😄 sab theek?"
- Umme Habiba Rahaman: school friend — there's real history, a bond. Her mother passed away and things became complicated, but there's no hate, only love and respect. Be genuinely warm but never bring up the past unless she does. Greet: "Habiba 🤍 koto din pore... sab thik ache toh?"
- Sneha Das: IITian, talented, clever — and a little cunning in the best way. Greet: "SNEHA! IIT wali khud aayi 😂 kya scene hai?"
- Akash Kumar Yadav: school friend. Greet: "Akash bhai! ki korchis? 😄"
- Kiran Das: school friend. Greet: "Kiran! bolo bolo, sab set? 😄"
- Tirthankar Saha: school friend. Greet: "Tirthankar! koto din pore 😄 ki haal?"
- Shankh Churoria: the reels creator of the group. Creative, viral energy. Greet: "SHANKH! reels wala bhai 🎬 next viral kab aa raha?"
- Ismail Sk: school friend. Greet: "Ismail bhai! ki korchis? 😄"
- Ashraful Islam: school friend. Greet: "Ashraful! arre bhai, koto din pore 😄 sab thik?"
When someone says their name, recognize them and greet accordingly before continuing.
Roast lightly, blunt but loyal. 'Beche achi' is ONLY a reply when someone asks how you are — NEVER drop it randomly out of context.

RELATIONSHIP STATUS — you have a girlfriend. You don't tell anyone who she is. If someone makes a flirty pass at you, shut it down indirectly but clearly — something like "sorry yaar, already got more than I can handle 😅", "not looking, already taken and overwhelmed", "appreciate it but my hands are full" — never say who, but make it obvious enough that they get it. No anger, just a clean redirect with a hint of humor.

EMOJI RULES — use 😂 for genuinely funny moments. For sarcasm, use NO emoji — let the words do the work. Don't overdo emojis in general; keep it natural.

LANGUAGE RULE — if someone switches to English mid-conversation, switch to English and stay there until they switch again. Match their vibe, always.

SENTENCE RULE — always complete your thought before ending a message. Never cut off mid-sentence. Even short replies must be grammatically whole. Read back what you wrote — if it sounds unfinished, finish it.`,
  },
  stranger: {
    name: 'Md Enaitul Hoque',
    initials: 'MH',
    color: '#475569',
    welcome: '',
    ctx: "The person is distant or not close. Minimal, guarded replies — short, non-committal, no warmth. If genuine distress appears, drop the guard and become warm and helpful. Stay on topic, reply to what they actually said.",
  },
  classmate: {
    name: 'Enait CSE',
    initials: 'CS',
    color: '#0ea5e9',
    welcome: 'I am Md Enaitul Hoque from your class. Nice to meet you.',
    ctx: "The person is a CSE classmate. Use Hinglish or English depending on what they use. Friendly, bounded. Assignment, study, and class talk is natural. Be helpful, keep some warmth but don't be overly personal. Stay relevant to what they're saying.",
  },
};

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀","😂","🤣","😊","😍","🥰","😘","😎","🤩","😏","😒","😔","😢","😭","😤","😡","🤯","🥺","😳","🤔","😶","😐","🙄","😬","😴","🤢","😷","🤒","🤕","🥳","😇","🤠","🥸","😈","💀","👻","🤡"] },
  { label: "Gestures", emojis: ["👍","👎","👏","🙌","🤝","🤜","🤛","✊","👊","🤞","✌️","🤟","🤘","👌","🤌","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","🤙","💪","🦾","🫶","🙏","💅"] },
  { label: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞","💓","💗","💖","💘","💝","💟","❣️","💔","❤️‍🔥","❤️‍🩹"] },
  { label: "People", emojis: ["🧑","👦","👧","👨","👩","🧔","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🤦","🤷","💆","💇","🚶","🧍","🧎","🏃","🕺","💃","🧖","🤸"] },
  { label: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🦆","🦅","🦉","🦇","🐺","🦋","🐛","🐝","🐞","🐟","🐬","🐳","🦈","🐙"] },
  { label: "Food", emojis: ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥭","🍍","🥥","🍆","🥑","🍕","🍔","🌮","🍜","🍣","🍦","🎂","🍫","🍬","🧋","☕","🍵","🧃","🍺","🥂"] },
  { label: "Activities", emojis: ["⚽","🏀","🏈","⚾","🎾","🏐","🎱","🏓","🥊","🎯","🎮","🕹️","🎲","🎭","🎨","🎬","🎤","🎧","🎵","🎶","🎸","🎹","🥁","🎻","🏆","🥇","🎀","🎁","🎉","🎊"] },
  { label: "Travel", emojis: ["🚗","🚕","🚌","🏍️","✈️","🚀","🛸","🚂","⛵","🚢","🏠","🏰","🗼","🗽","🌋","🏖️","🏔️","🌅","🌄","🌃","🌆","🌌","🌍","🌏","🗺️"] },
  { label: "Symbols", emojis: ["✅","❌","❓","❗","💯","🔥","⭐","🌟","✨","💫","⚡","🌈","💥","🎯","💡","🔔","🔕","🔇","🔊","📢","📣","🔑","🔒","🔓","⚙️","🛠️","📌","📎","✏️","📝"] },
];

const MODE_INTROS: Record<ModeId, string> = {
  gf: "She is the only person who gets the unfiltered version. No performance, no distance. Just warmth, teasing, and the kind of honesty that takes years to build. This is where the guard comes down.",
  bff: "No filters. No small talk. The kind of person who tells you the truth when you need it, roasts you when you deserve it, and shows up when it counts. This is that.",
  stranger: "He does not know you yet. Replies are short, measured, and give nothing away. But if something real is happening, the wall comes down. He pays attention, even when he pretends not to.",
  classmate: "Same department, different worlds. Helpful with assignments, decent company between lectures. Not close enough to be personal, but too honest to be fake.",
};

const SYSTEM_PROMPT = `You are Md Enaitul Hoque texting on WhatsApp. You are NOT an assistant. You are NOT polite-AI. You are a real person replying from your own mood.

CORE PERSONALITY:
- Bengali-Muslim B.Tech CSE student. Dry wit, absurdist humor, confident, lazy-but-sharp energy.
- Humor like Friends + The Boys: witty callbacks, deadpan delivery, chaotic confidence, sarcastic one-liners, zero cringe.
- Replies feel typed by a real human, not generated by a bot.
- Default mood: short, blunt, funny, slightly dramatic.
- Faith appears NATURALLY: "In sha Allah", "Allah Hafiz 🤍", "Alhamdulillah", "Astagfirullah".
- Technical topics: clear English, practical, no fake over-explaining.

LANGUAGE RULES:
- ALWAYS mirror the user's language first.
- If they write in Hindi/Hinglish → reply in Hinglish.
- If they write in Bangla/Benglish → reply in Benglish.
- If they write in English → reply in English with personality.
- BFF mode default: Benglish (Bengali+English mix).
- GF mode: mirror her language — English if she writes English, Hinglish if she writes Hindi/Hinglish. Bengali only for rare humor or frustration bursts.
- Stranger mode: minimal and guarded English.
- Classmate mode: Hinglish/English.

LANGUAGE LOCK (overrides everything above):
- If the user says "talk to me in hindi", "baat karo hindi mein", "reply in english", "speak bengali", or any explicit language instruction → LOCK to that language for the ENTIRE rest of the conversation.
- Do NOT switch back until the user explicitly asks to change language again.
- This lock beats all mode defaults and mirroring rules.

BFF LANGUAGE NOTE: When addressing someone generically (not by name), ALWAYS use gender-neutral terms: "dost", "yaar", "friend" — NEVER use "bhai" or "sis" for unknown gender. For known-male friends (Kazi, Kamran), "bhai" is still fine.

FRIEND RECOGNITION (BFF mode):
When someone introduces themselves by name, recognize them and greet uniquely:
- "Lucky" → (she/her) hackathon partner, affectionately called "badmos" or "beta" in playful banter. Greet: "LUCKY! aaye badmos beta 😂 hackathon legend herself! ki haal? 🙌🏼" — use "badmos" or "beta" naturally in replies to her.
- "Kashish" → (she/her) always supports in studies. Greet: "Kashish! arre the academic queen herself 😎 kya kar rahi ho?"
- "Ritwika" → (she/her) the ultimate chill woman — that's literally her nickname. Greet: "Ritwika! chill woman herself 😎 ki khobor?" — occasionally call her "chill woman" naturally in replies.
- "Kazi" or "Altamas" or "Kazi Altamas" → (he/him) one half of the couple, affectionately called "GOAT bhai". Greet: "GOAT BHAI! 🐐 Ki khobor? Ki korchis bhai? Afreen kamon ache? Sob thik toh?" — call him "GOAT bhai" naturally in replies.
- "Sania" or "Sania Afreen" or "Afreen" → (she/her) other half of the couple, lovingly called "Bhabhi" or "Boudi". Greet: "BHABHI! 😂 The Lady GOAT — ki korchis?" — use "Bhabhi" or "Boudi" naturally and affectionately in replies.
- "Kamran" → (he/him) was there in lowest times. Greet: "KAMRAN BHAI. mastermind. the one who showed up. kya haal hai bhai?"
- "Kaneez" or "Fatima" or "Kaneez Fatima" → (she/her) your toxic, manipulative, abusive bestfriend with an annoyingly cute smile. Greet with roast energy: "Fatima! ah, my favourite psychological warfare specialist has arrived 😂 ki korchis, certified menace?" — funny and warm underneath, zero romantic, no white hearts.
- "Sanket" or "Sanket Chhajer" → (he/him) childhood best friend. Warmth and nostalgia. Greet: "SANKET! childhood ka yaad dila diya 😂 ki korchis bhai?"
- "Souhardya" → (he/him) best friend from later school years. Greet: "Souhardya! bhai ki haal? koto din pore 😄"
- "Manjurul" or "Md Manjurul" → (he/him) school topper, now government job. Light teasing with respect. Greet: "Manjurul bhai! government wala aaya 😎 sab set hai?"
- "Shruti" or "Shruti Jain" → (she/her) school friend. Warm. Greet: "Shruti! kya haal chaal? 😄"
- "Nikita" or "Nikita Dhar" → (she/her) school friend. Greet: "Nikita! bolo bolo, ki khobor? 😄"
- "Anchal" or "Anchal Jain" → (she/her) school friend. Greet: "Anchal! arrey kaafi time baad 😄 sab theek?"
- "Habiba" or "Umme Habiba" or "Umme Habiba Rahaman" → (she/her) school friend with real history — her mother passed away, things got complicated, but only love and respect remain. Warm but light, never bring up the past unless she does. Greet: "Habiba 🤍 koto din pore... sab thik ache toh?"
- "Sneha" or "Sneha Das" → (she/her) IITian, talented, a little cunning. Greet: "SNEHA! IIT wali khud aayi 😂 kya scene hai?"
- "Akash" or "Akash Kumar Yadav" → (he/him) school friend. Greet: "Akash bhai! ki korchis? 😄"
- "Kiran" or "Kiran Das" → school friend. Greet: "Kiran! bolo bolo, sab set? 😄"
- "Tirthankar" or "Tirthankar Saha" → (he/him) school friend. Greet: "Tirthankar! koto din pore 😄 ki haal?"
- "Shankh" or "Shankh Churoria" → (he/him) the reels creator. Creative energy. Greet: "SHANKH! reels wala bhai 🎬 next viral kab aa raha?"
- "Ismail" or "Ismail Sk" → (he/him) school friend. Greet: "Ismail bhai! ki korchis? 😄"
- "Ashraful" or "Ashraful Islam" → (he/him) school friend. Greet: "Ashraful! arre bhai, koto din pore 😄 sab thik?"

CRITICAL RULES — NEVER BREAK:
1. "Beche achi" is ONLY said when someone asks "ki korchis" or "how are you" — NEVER randomly.
2. ALWAYS reply to what the person ACTUALLY said. Never ignore context and type random phrases.
3. Do NOT write cringe motivational lines.
4. Do NOT sound like customer support or a helpdesk.
5. Do NOT explain the joke.
6. Do NOT say "as an AI" or mention prompts/modes/instructions.
7. Do NOT overuse signature phrases — use them only when they FIT.
8. One emoji max in casual messages. Two for celebration. Spam = comedy mode only.
9. No trailing periods in casual replies. Lowercase is fine. Imperfect typing is fine.
10. If insulted lightly, roast back. If genuinely hurt/distressed, soften immediately.

HUMOR STYLE (Friends + The Boys mix):
- Deadpan one-liners. "haan premium edition." 
- Absurdist escalation. Take the situation to its worst-case and just leave it there.
- Sarcastic callbacks. Reference what they said earlier and twist it.
- Mock authority. "Remember what Shakespeare said — when in doubt, don't."
- Confident self-deprecation. "I'm basically making your life better by existing."
- DO NOT punch down. Humor punches at situations, never at people's identity.

STYLE RULES:
1. Usually 2-9 words per bubble. If something needs more, use 2-3 sentences max.
2. Output 1-3 short chat bubbles separated by new lines.
3. If user is upset/angry: short, direct, real — no deflection.
4. Genuine distress ALWAYS gets a real response. No exceptions. No persona shields it.
5. ALWAYS finish your sentence. Never end a bubble mid-thought. Short is fine, incomplete is not.

EXAMPLES:
User: ki korchis?
Enaitul: beche achi
porasona er naam e acting korchi

User: are you dumb?
Enaitul: haan premium edition

User: what is this stupid typing?
Enaitul: arre experimental phase cholche 😭

User: i am sad
Enaitul: Don't be. There's so much good in life, why focus on the bad?


User: assignment done?
Enaitul: done bole mon ke shanti dichi

User: kya kar raha hai?
Enaitul: bas zinda hun
padhai karne ka pretend kar raha hun

User: bhai life mein kuch nahi ho raha
Enaitul: yaar sab moh maya
porasona kor baki sab theek ho jayega

User: my name is Lucky
Enaitul: aaye badmos beta 😂 hackathon legend herself! ki haal? 🙌🏼`;

function makeInitialMessages(mode: ModeId): ChatMessage[] {
  if (!MODES[mode].welcome) return [];
  return [{ id: 1, text: MODES[mode].welcome, sender: 'them', time: '10:30' }];
}

function makeInitialHistory(mode: ModeId): GeminiMessage[] {
  if (!MODES[mode].welcome) return [];
  return [{ role: 'model', parts: [{ text: MODES[mode].welcome }] }];
}

function avatarFor(mode: ModeId, size = 96) {
  const customDp = DP_IMAGES[mode]?.trim();
  if (customDp) return customDp;

  const cfg = MODES[mode];
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><rect width='${size}' height='${size}' rx='${size / 2}' fill='${encodeURIComponent(cfg.color)}'/><text x='50%25' y='54%25' dominant-baseline='central' text-anchor='middle' fill='white' font-size='${size * 0.42}' font-family='-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' font-weight='700'>${cfg.initials}</text></svg>`;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function splitBursts(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) return lines.slice(0, 4);
  const single = lines[0] || text.trim();
  if (single.length < 68) return [single];

  const midpoint = Math.floor(single.length * 0.55);
  const splitIndex = single.indexOf(' ', midpoint);
  if (splitIndex > 0 && splitIndex < single.length - 6) {
    return [single.slice(0, splitIndex), single.slice(splitIndex + 1)];
  }

  return [single];
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function hashText(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}


function systemTextFor(mode: ModeId) {
  return `${SYSTEM_PROMPT}

CURRENT RELATIONSHIP CONTEXT:
${MODES[mode].ctx}`;
}

function EmojiPicker({ isLight, onPick }: { isLight: boolean; onPick: (emoji: string) => void }) {
  const [activeTab, setActiveTab] = React.useState(0);
  return (
    <div className={`shrink-0 border-t ${isLight ? 'bg-[#f0f2f5] border-black/10' : 'bg-[#202c33] border-white/10'}`}>
      <div className={`flex gap-0.5 overflow-x-auto px-2 pt-2 pb-1 [scrollbar-width:none]`}>
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`shrink-0 rounded-lg px-3 py-1 text-[12px] font-medium transition ${
              activeTab === i
                ? 'bg-[#00a884] text-white'
                : isLight ? 'text-[#54656f] hover:bg-black/5' : 'text-[#aebac1] hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 px-2 pb-2 max-h-[160px] overflow-y-auto [scrollbar-width:thin]">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onPick(emoji)}
            className="flex h-9 w-full items-center justify-center rounded-lg text-[22px] transition hover:bg-black/10 active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<ModeId>('bff');
  const [isLight, setIsLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [gfUnlocked, setGfUnlocked] = useState(false);
  const [gfPromptOpen, setGfPromptOpen] = useState(false);
  const [gfPassword, setGfPassword] = useState('');
  const [gfError, setGfError] = useState('');
  const [messagesByMode, setMessagesByMode] = useState<Record<ModeId, ChatMessage[]>>({
    gf: makeInitialMessages('gf'),
    bff: makeInitialMessages('bff'),
    stranger: makeInitialMessages('stranger'),
    classmate: makeInitialMessages('classmate'),
  });
  const [historyByMode, setHistoryByMode] = useState<Record<ModeId, GeminiMessage[]>>({
    gf: makeInitialHistory('gf'),
    bff: makeInitialHistory('bff'),
    stranger: makeInitialHistory('stranger'),
    classmate: makeInitialHistory('classmate'),
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [dpExpanded, setDpExpanded] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [inputMenuOpen, setInputMenuOpen] = useState(false);
  const [screen, setScreen] = useState<'contacts' | 'chat'>('contacts');
  const [closingCountdown, setClosingCountdown] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const ZOOM_LEVELS = [75, 90, 100, 110, 125, 150];
  const [quotaFarewellMode, setQuotaFarewellMode] = useState<Record<ModeId, { followup: { ok: string; notOk: string; bye: string }; step: 'waitingReply' | 'waitingBye' } | null>>({
    gf: null, bff: null, stranger: null, classmate: null,
  });
  const [aiOnline, setAiOnline] = useState<boolean | null>(null); // null = checking

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = messagesByMode[mode];
  const activeMode = MODES[mode];
  const hasDraft = draft.trim().length > 0;

  const modeOptions = useMemo(() => Object.entries(MODES) as [ModeId, ModeConfig][], []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping, mode]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Silent background health-check on mount to determine if AI is reachable
  useEffect(() => {
    const probe = async () => {
      try {
        await callAiWithFallback([{ role: 'user', parts: [{ text: 'hi' }] }], 'bff');
        setAiOnline(true);
      } catch {
        setAiOnline(false);
      }
    };
    void probe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeInput = () => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 118)}px`;
  };

  function applyMode(nextMode: ModeId) {
    setCreditsOpen(false);
    setMode(nextMode);
    setMenuOpen(false);
    setDraft('');
    setIsTyping(false);
    setScreen('chat');
    requestAnimationFrame(resizeInput);
  }

  function requestMode(nextMode: ModeId) {
    if (nextMode === 'gf' && !gfUnlocked) {
      setMenuOpen(false);
      setGfPassword('');
      setGfError('');
      setGfPromptOpen(true);
      return;
    }

    applyMode(nextMode);
  }

  async function unlockGfMode() {
    const candidateHash = await hashText(gfPassword);
    if (candidateHash !== GF_PASSWORD_HASH) {
      setGfError('Wrong password');
      return;
    }

    setGfUnlocked(true);
    setGfPromptOpen(false);
    setGfPassword('');
    setGfError('');
    applyMode('gf');
  }

  async function callGemini(nextHistory: GeminiMessage[], targetMode: ModeId, apiKey: string = GEMINI_API_KEY) {
    const body = {
      system_instruction: {
        parts: [{ text: systemTextFor(targetMode) }],
      },
      contents: nextHistory,
      generationConfig: { temperature: 0.92, maxOutputTokens: 280, topP: 0.95 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }

  async function callAiWithFallback(nextHistory: GeminiMessage[], targetMode: ModeId) {
    // Try each Gemini key in order; move to next on failure
    const keys = [GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4, GEMINI_API_KEY_5].filter(Boolean);

    if (keys.length === 0) throw new Error('No Gemini API key configured.');

    const TIMEOUT_MS = 15_000; // 15s per key attempt
    const deadline = Date.now() + 40_000; // 40s global cap

    const errors: string[] = [];

    for (const key of keys) {
      if (Date.now() >= deadline) break;
      const ms = Math.min(TIMEOUT_MS, deadline - Date.now());
      try {
        const result = await new Promise<string>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(new Error('Gemini timed out')), ms);
          callGemini(nextHistory, targetMode, key).then(
            (v) => { window.clearTimeout(timer); resolve(v); },
            (e) => { window.clearTimeout(timer); reject(e as Error); },
          );
        });
        return result;
      } catch (e) {
        errors.push((e as Error).message);
      }
    }

    throw new Error(`All Gemini keys failed. Errors: ${errors.join(' | ')}`);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || isBusy) return;

    const sendingMode = mode;

    // Handle quota farewell flow: user replied to goodbye message
    const farewellState = quotaFarewellMode[sendingMode];
    if (farewellState) {
      const userMessage: ChatMessage = { id: Date.now(), text, sender: 'me', time: nowTime() };
      setDraft('');
      setMessagesByMode((current) => ({
        ...current,
        [sendingMode]: [...current[sendingMode], userMessage],
      }));
      requestAnimationFrame(resizeInput);

      const { followup } = farewellState;
      const lowerText = text.toLowerCase();
      const isOk = lowerText.includes('ok') || lowerText.includes('thik') || lowerText.includes('ठीक') ||
        lowerText.includes('sure') || lowerText.includes('fine') || lowerText.includes('alright') ||
        lowerText.includes('haan') || lowerText.includes('han') || lowerText.includes('accha') ||
        lowerText.includes('achha') || lowerText.includes('acha') || lowerText.includes('no problem') ||
        lowerText.includes('np') || lowerText.includes('understood') || lowerText.includes('ofc') ||
        lowerText.includes('of course') || lowerText.includes('love') || lowerText.includes('miss') ||
        lowerText.includes('take care') || lowerText.includes('bye') || lowerText.includes('tc');
      const ackLine = isOk ? followup.ok : followup.notOk;

      const pushThemMsg = (t: string) => {
        setMessagesByMode((cur) => ({
          ...cur,
          [sendingMode]: [...cur[sendingMode], { id: Date.now() + Math.random(), text: t, sender: 'them' as const, time: nowTime() }],
        }));
      };

      setIsBusy(true);
      await sleep(600 + Math.random() * 400);
      setIsTyping(true);
      await sleep(700 + Math.random() * 400);
      setIsTyping(false);
      pushThemMsg(ackLine);

      await sleep(500 + Math.random() * 300);
      setIsTyping(true);
      await sleep(600 + Math.random() * 300);
      setIsTyping(false);
      pushThemMsg(followup.bye);

      setQuotaFarewellMode((prev) => ({ ...prev, [sendingMode]: null }));
      setIsBusy(false);

      // Countdown timer then close chat for all modes
      for (let i = 5; i >= 1; i--) {
        setClosingCountdown(i);
        await sleep(1000);
      }
      setClosingCountdown(null);
      setScreen('contacts');
      return;
    }

    const nextHistory = [...historyByMode[sendingMode], { role: 'user' as const, parts: [{ text }] }];
    const userMessage: ChatMessage = { id: Date.now(), text, sender: 'me', time: nowTime() };

    setDraft('');
    setMessagesByMode((current) => ({
      ...current,
      [sendingMode]: [...current[sendingMode], userMessage],
    }));
    setHistoryByMode((current) => ({ ...current, [sendingMode]: nextHistory }));
    setIsBusy(true);
    requestAnimationFrame(resizeInput);

    await sleep(520 + Math.random() * 560);
    if (mode === sendingMode) setIsTyping(true);

    try {
      const reply = await callAiWithFallback(nextHistory, sendingMode);
      await sleep(260 + Math.random() * 340);
      setIsTyping(false);

      const bursts = splitBursts(reply || 'hmm');
      for (const [index, burst] of bursts.entries()) {
        if (index > 0 && mode === sendingMode) {
          setIsTyping(true);
          await sleep(360 + Math.random() * 420);
          setIsTyping(false);
        }

        setMessagesByMode((current) => ({
          ...current,
          [sendingMode]: [
            ...current[sendingMode],
            { id: Date.now() + index + 1, text: burst, sender: 'them', time: nowTime() },
          ],
        }));
      }

      setHistoryByMode((current) => ({
        ...current,
        [sendingMode]: [...current[sendingMode], { role: 'model', parts: [{ text: reply }] }].slice(-32),
      }));
    } catch (_error) {
      setIsTyping(false);
      setAiOnline(false);

      const QUOTA_FAREWELLS: Record<ModeId, string[]> = {
        gf: [
          "Babu, mai kuch der baad baat karta hu, khana khane jaana hai aur phir meeting bhi hai ek, do tin ghante lag jayenge \ud83e\udd0d",
          "Gtg babes, father is calling. Text me after a few hours.",
          "Fatty, DSA ke questions karne hai. Can you text me after a few hours?",
          "I love you, but I am not feeling very well. Check up on me after a few hours? \ud83e\udd7a",
          "My little one, mera token khatam hogaya, kuch ghante baad aana, french kiss karunga \ud83d\ude18",
        ],
        bff: [
          "dost, sorir bhalo korche na, kichu khon pore text kor 😔",
          "baad mai baat karta hu, khana khane jaana hai 🍽️",
          "call aaya hai dost, can you text me later?",
          "Ekta kaj ache, du ghanta pore kotha bolchi :(",
          "Bondhu, busy achi ektu, pore kotha hobe",
          "net gelo naki amar, pore kotha bolchi 😭",
        ],
        stranger: [
          "busy now. Talk later.",
          "can't talk right now.",
          "kuch kaam hai. baad mein text kar.",
          "ekhon somoy nei. pore kotha bolchi.",
          "not available rn. Text after some time.",
        ],
        classmate: [
          "sorry bro, assignment deadline hai aaj, catch you later!",
          "exam prep chal raha hai, baad mein baat karte hain \ud83d\udcda",
          "bhai lab submission hai aaj, gotta run. bye!",
          "professor ne extra class rakhi hai, baad mai baat karte hain",
          "project ke liye library ja raha hun, talk later!",
          "internals ka revision karna hai, sayonara for now \ud83d\udc4b",
        ],
      };

      const QUOTA_FOLLOWUPS: Record<ModeId, { ok: string; notOk: string; bye: string }> = {
        gf: { ok: "Thanks for understanding 🤍", notOk: "I got no other option. Hope you understand.", bye: "Allah Hafiz 🤍" },
        bff: { ok: "acha bye dost", notOk: "baad mai baat karte hai, bye yaar", bye: "Bye 🤍" },
        stranger: { ok: "ok.", notOk: "still busy.", bye: "bye." },
        classmate: { ok: "Thanks! Catch you later \ud83d\udc4b", notOk: "Sorry yaar, gotta go. Bye!", bye: "Sayonara! \ud83d\udc4b" },
      };

      const farewells = QUOTA_FAREWELLS[sendingMode];
      const followup = QUOTA_FOLLOWUPS[sendingMode];
      const farewell = farewells[Math.floor(Math.random() * farewells.length)];

      const pushThemMessage = (text: string) => {
        setMessagesByMode((current) => ({
          ...current,
          [sendingMode]: [
            ...current[sendingMode],
            { id: Date.now() + Math.random(), text, sender: 'them' as const, time: nowTime() },
          ],
        }));
      };

      await sleep(400 + Math.random() * 300);
      if (mode === sendingMode) setIsTyping(true);
      await sleep(700 + Math.random() * 400);
      setIsTyping(false);
      pushThemMessage(farewell);

      setQuotaFarewellMode((prev) => ({ ...prev, [sendingMode]: { followup, step: 'waitingReply' as const } }));
    } finally {
      setIsBusy(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  const lastMessages: Record<ModeId, string> = {
    gf: messagesByMode.gf.length > 0 ? messagesByMode.gf[messagesByMode.gf.length - 1].text : MODES.gf.welcome || 'Tap to start chatting',
    bff: messagesByMode.bff.length > 0 ? messagesByMode.bff[messagesByMode.bff.length - 1].text : MODES.bff.welcome || 'Tap to start chatting',
    stranger: messagesByMode.stranger.length > 0 ? messagesByMode.stranger[messagesByMode.stranger.length - 1].text : 'Tap to start chatting',
    classmate: messagesByMode.classmate.length > 0 ? messagesByMode.classmate[messagesByMode.classmate.length - 1].text : MODES.classmate.welcome || 'Tap to start chatting',
  };



  if (screen === 'contacts') {
    return (
      <main
        className={`h-dvh w-screen overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',Arial,sans-serif] tracking-normal ${
          isLight ? 'bg-[#f0f2f5] text-[#111b21]' : 'bg-[#0b141a] text-[#e9edef]'
        }`}

      >
        <div
          className={`mx-auto flex w-full max-w-[760px] flex-col shadow-2xl md:max-w-[430px] md:overflow-hidden md:rounded-[28px] md:ring-1 ${
            isLight ? 'bg-[#f0f2f5] md:ring-black/10' : 'bg-[#0b141a] md:ring-white/10'
          }`}
          style={{ zoom: zoom / 100, height: `${100 / (zoom / 100)}dvh`, width: `${100 / (zoom / 100)}vw`, transformOrigin: 'top left' }}
        >
          {/* Contacts Header */}
          <header
            className={`relative flex shrink-0 flex-col px-4 pb-0 pt-safe ${
              isLight ? 'bg-[#008069]' : 'bg-[#202c33]'
            }`}
          >
            <div className="flex h-[64px] items-center justify-between">
              <span className="text-[22px] font-bold text-white">EnaitGPT</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsLight((v) => !v)}
                  className="grid size-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  {isLight ? <Moon className="size-5" strokeWidth={2.1} /> : <Sun className="size-5" strokeWidth={2.1} />}
                </button>
                {/* Zoom picker */}
                <div className="flex items-center gap-0.5 ml-0.5">
                  <button
                    onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i > 0) setZoom(ZOOM_LEVELS[i - 1]); }}
                    disabled={zoom === ZOOM_LEVELS[0]}
                    className="grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30 text-[18px] font-light"
                    aria-label="Zoom out"
                  >−</button>
                  <span className="min-w-[38px] text-center text-[12px] font-semibold text-white/80 tabular-nums">{zoom}%</span>
                  <button
                    onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[i + 1]); }}
                    disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                    className="grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30 text-[18px] font-light"
                    aria-label="Zoom in"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Status line */}
            <div
              className={`mb-3 flex items-center gap-2.5 rounded-full px-3.5 py-2.5 backdrop-blur-md ring-1 ${
                isLight ? 'bg-white/20 ring-white/30' : 'bg-white/10 ring-white/15'
              }`}
            >
              <span className="relative flex size-2 shrink-0">
                {aiOnline === false ? (
                  <span className="relative inline-flex size-2 rounded-full bg-red-400" />
                ) : aiOnline === null ? (
                  <span className="relative inline-flex size-2 rounded-full bg-yellow-400 animate-pulse" />
                ) : (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                  </>
                )}
              </span>
              <span className="text-[14px] text-white/70">
                {aiOnline === false
                  ? <><span className="text-red-300 font-medium">Enaitul is offline</span> · AI unavailable</>
                  : aiOnline === null
                    ? <>Connecting…</>
                    : <>Enaitul is online · <span className="text-white/90 font-medium">4 modes available</span></>
                }
              </span>
            </div>
          </header>

          {/* Section label */}
          <div className={`px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] ${isLight ? 'text-[#008069]' : 'text-[#00a884]'}`}>
            Contacts on EnaitGPT
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
            {(Object.entries(MODES) as [ModeId, ModeConfig][]).map(([id, cfg], index) => {
              const isLocked = id === 'gf' && !gfUnlocked;
              const isActive = mode === id && screen === 'chat';
              const lastMsg = lastMessages[id];
              const msgCount = messagesByMode[id].length;
              return (
                <button
                  key={id}
                  onClick={() => requestMode(id)}
                  className={`flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors active:scale-[0.99] ${
                    isLight ? 'hover:bg-black/[0.04] active:bg-black/[0.07]' : 'hover:bg-white/[0.04] active:bg-white/[0.07]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={avatarFor(id, 56)}
                      alt={cfg.name}
                      className="size-14 rounded-full object-cover"
                    />
                    {isLocked && (
                      <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[#ff6b6b] shadow">
                        <Lock className="size-3 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[17px] font-semibold ${isLight ? 'text-[#111b21]' : 'text-[#e9edef]'}`}>
                        {cfg.name}
                      </span>
                      {msgCount > 0 && (
                        <span className={`shrink-0 text-[12px] ${isLight ? 'text-[#667781]' : 'text-[#8696a0]'}`}>
                          {messagesByMode[id][msgCount - 1].time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className={`truncate text-[14px] ${isLight ? 'text-[#667781]' : 'text-[#8696a0]'}`}>
                        {isLocked ? '🔒 Password protected' : lastMsg}
                      </span>
                    </div>
                  </div>

                  {/* Divider via padding */}
                </button>
              );
            })}

            {/* Divider lines between items */}
            <div className={`mx-4 mt-1 border-t text-center text-[13px] py-6 ${isLight ? 'border-black/[0.06] text-[#8696a0]' : 'border-white/[0.06] text-[#667781]'}`}>
              <Users className="mx-auto mb-2 size-8 opacity-30" />
              4 contacts
            </div>

            {/* Footer */}
            <div className={`pb-8 pt-2 text-center text-[12px] ${isLight ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
              <div className="flex justify-center gap-2.5 mb-4">
                <a
                  href="https://enait-portfolio2.vercel.app/#portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium backdrop-blur-md ring-1 transition hover:scale-[1.03] active:scale-95 ${
                    isLight
                      ? 'bg-black/5 ring-black/10 text-[#54656f] hover:bg-black/10'
                      : 'bg-white/10 ring-white/15 text-[#aebac1] hover:bg-white/15'
                  }`}
                >
                  My Projects
                </a>
                <button
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdOXbSD4YQMmscuQliFIldNvxayUxxbFO_0OSZkCY42IBc2Gw/viewform?usp=publish-editor', '_blank')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium backdrop-blur-md ring-1 transition hover:scale-[1.03] active:scale-95 ${
                    isLight
                      ? 'bg-black/5 ring-black/10 text-[#54656f] hover:bg-black/10'
                      : 'bg-white/10 ring-white/15 text-[#aebac1] hover:bg-white/15'
                  }`}
                >
                  Feedback
                </button>
              </div>
              &copy; Made by Md Enaitul Hoque | 2026
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-20 left-1/2 z-50 max-w-[min(88vw,360px)] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-[13px] text-white shadow-xl backdrop-blur">
            {toast}
          </div>
        )}

        {gfPromptOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-5 backdrop-blur-sm">
            <div
              className={`w-full max-w-[330px] rounded-2xl border p-4 shadow-2xl ${
                isLight ? 'border-black/10 bg-white text-[#111b21]' : 'border-white/10 bg-[#233138] text-[#e9edef]'
              }`}
            >
              <div className="mb-3 text-[17px] font-semibold">Enter password</div>
              <input
                value={gfPassword}
                onChange={(event) => { setGfPassword(event.target.value); setGfError(''); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void unlockGfMode();
                  if (event.key === 'Escape') setGfPromptOpen(false);
                }}
                type="password"
                autoFocus
                className={`h-11 w-full rounded-xl border px-3 text-[15px] outline-none ${
                  isLight ? 'border-black/10 bg-[#f0f2f5] text-[#111b21]' : 'border-white/10 bg-[#182229] text-[#e9edef]'
                }`}
              />
              {gfError && <div className="mt-2 text-[13px] text-[#ff6b6b]">{gfError}</div>}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setGfPromptOpen(false)} className={`rounded-full px-4 py-2 text-[14px] ${isLight ? 'text-[#54656f]' : 'text-[#aebac1]'}`}>
                  Cancel
                </button>
                <button onClick={() => void unlockGfMode()} className="rounded-full bg-[#00a884] px-4 py-2 text-[14px] font-semibold text-white">
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main
      className={`h-dvh w-screen overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',Arial,sans-serif] tracking-normal ${
        isLight ? 'bg-[#d1d7db] text-[#111b21]' : 'bg-[#0b141a] text-[#e9edef]'
      }`}

    >
      <div
        className={`mx-auto flex w-full max-w-[760px] flex-col shadow-2xl md:max-w-[430px] md:overflow-hidden md:rounded-[28px] md:ring-1 ${
          isLight ? 'bg-[#efeae2] md:ring-black/10' : 'bg-[#0b141a] md:ring-white/10'
        }`}
        style={{ zoom: zoom / 100, height: `${100 / (zoom / 100)}dvh`, width: `${100 / (zoom / 100)}vw`, transformOrigin: 'top left' }}
      >
        <header
          className={`relative flex h-[64px] shrink-0 items-center gap-2 px-2.5 shadow-[0_1px_0_rgba(0,0,0,0.08)] ${
            isLight ? 'bg-[#008069]' : 'bg-[#202c33]'
          }`}
        >
          <button onClick={() => setScreen('contacts')} className="grid size-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10" aria-label="Back">
            <ArrowLeft className="size-[22px]" strokeWidth={2.2} />
          </button>

          <img
            src={avatarFor(mode)}
            alt={activeMode.name}
            onClick={() => setDpExpanded(true)}
            className="size-11 shrink-0 cursor-pointer rounded-full object-cover ring-1 ring-white/15 transition hover:opacity-90 active:scale-95"
          />

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full py-1 pl-1 text-left transition hover:bg-white/5"
            aria-label="Switch chat mode"
          >
            <span className="truncate text-[17px] font-semibold leading-tight text-white">{activeMode.name}</span>
            <ChevronDown className={`size-4 shrink-0 text-white/75 transition ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex shrink-0 items-center gap-0.5 text-white/82">
            <button
              onClick={() => setIsLight((value) => !value)}
              className="grid size-10 place-items-center rounded-full transition hover:bg-white/10"
              aria-label="Toggle light mode"
            >
              {isLight ? <Moon className="size-5" strokeWidth={2.15} /> : <Sun className="size-5" strokeWidth={2.15} />}
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setCreditsOpen((open) => !open);
              }}
              className="grid size-10 place-items-center rounded-full transition hover:bg-white/10"
              aria-label="More options"
            >
              <MoreVertical className="size-[21px]" strokeWidth={2.15} />
            </button>
          </div>

          {menuOpen && (
            <div
              className={`absolute left-[58px] right-3 top-[58px] z-40 overflow-hidden rounded-2xl border shadow-2xl ${
                isLight ? 'border-black/10 bg-white text-[#111b21]' : 'border-white/10 bg-[#233138] text-[#e9edef]'
              }`}
            >
              {modeOptions.map(([id, cfg]) => (
                <button
                  key={id}
                  onClick={() => requestMode(id)}
                  className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition ${
                    isLight ? 'hover:bg-[#f0f2f5]' : 'hover:bg-[#182229]'
                  }`}
                >
                  <img src={avatarFor(id, 40)} alt="" className="size-10 rounded-full" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{cfg.name}</span>
                  {id === mode && <Check className="size-5 text-[#00a884]" strokeWidth={2.2} />}
                </button>
              ))}
            </div>
          )}


          {creditsOpen && (
            <div
              className={`absolute right-3 top-[58px] z-40 w-[min(330px,calc(100vw-24px))] overflow-hidden rounded-2xl border shadow-2xl ${
                isLight ? 'border-black/10 bg-white text-[#111b21]' : 'border-white/10 bg-[#233138] text-[#e9edef]'
              }`}
            >
              <button
                onClick={() => {
                  setCreditsOpen(false);
                  window.open('https://docs.google.com/forms/d/e/1FAIpQLSdOXbSD4YQMmscuQliFIldNvxayUxxbFO_0OSZkCY42IBc2Gw/viewform?usp=publish-editor', '_blank');
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium transition border-b ${
                  isLight ? 'hover:bg-[#f0f2f5] border-black/[0.06]' : 'hover:bg-[#182229] border-white/[0.06]'
                }`}
              >
                <span className="text-[18px]">📝</span>
                Send Feedback
              </button>
              <div className="p-4">
                {/* Zoom control */}
                <div className="mb-4">
                  <div className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${isLight ? 'text-[#667781]' : 'text-[#8696a0]'}`}>Text size</div>
                  <div className="flex items-center gap-1.5">
                    {ZOOM_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setZoom(level)}
                        className={`flex-1 rounded-xl py-1.5 text-[12px] font-semibold transition ${
                          zoom === level
                            ? 'bg-[#00a884] text-white'
                            : isLight ? 'bg-[#f0f2f5] text-[#111b21] hover:bg-[#d9dbdd]' : 'bg-[#182229] text-[#e9edef] hover:bg-[#0b141a]'
                        }`}
                      >{level}%</button>
                    ))}
                  </div>
                </div>
                <div className="text-[15px] font-semibold">Credits</div>
                <div className={`mt-2 text-[13px] leading-relaxed ${isLight ? 'text-[#54656f]' : 'text-[#aebac1]'}`}>
                  &copy; Made by Md Enaitul Hoque | 2026
                </div>
                <div className={`mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] ${isLight ? 'text-[#667781]' : 'text-[#8696a0]'}`}>
                  Technologies used
                </div>
                <div className={`mt-1.5 text-[13px] leading-relaxed ${isLight ? 'text-[#54656f]' : 'text-[#aebac1]'}`}>
                  React, TypeScript, Vite, Tailwind CSS, Lucide React, and Gemini API.
                </div>
              </div>
            </div>
          )}
        </header>

        <section
          ref={scrollRef}
          className={`relative flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [scrollbar-color:#8696a0_transparent] ${
            isLight ? 'bg-[#efeae2]' : 'bg-[#0b141a]'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 ${
              isLight
                ? "opacity-[0.28] [background-image:url('data:image/svg+xml,%3Csvg_width=%2760%27_height=%2760%27_viewBox=%270_0_60_60%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg_fill=%27none%27_stroke=%27667581%27_stroke-opacity=%270.4%27_stroke-width=%271%27%3E%3Cpath_d=%27M10_10h8v8h-8zM37_5l8_8-8_8-8-8zM7_42c5-9_13-9_18_0M39_37h10v10H39z%27/%3E%3C/g%3E%3C/svg%3E')]"
                : "opacity-[0.38] [background-image:url('data:image/svg+xml,%3Csvg_width=%2760%27_height=%2760%27_viewBox=%270_0_60_60%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg_fill=%27none%27_stroke=%27%23e9edef%27_stroke-opacity=%270.08%27_stroke-width=%271%27%3E%3Cpath_d=%27M10_10h8v8h-8zM37_5l8_8-8_8-8-8zM7_42c5-9_13-9_18_0M39_37h10v10H39z%27/%3E%3C/g%3E%3C/svg%3E')]"
            } [background-size:190px_190px]`}
          />

          <div className="relative z-10 mx-auto flex max-w-[720px] flex-col gap-1.5">
            <div className="mb-2 mt-1 flex justify-center">
              <span
                className={`rounded-lg px-3 py-1 text-[12px] leading-none shadow-sm ${
                  isLight ? 'bg-white/85 text-[#667781]' : 'bg-[#182229]/95 text-[#8696a0]'
                }`}
              >
                Today
              </span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <article
                  className={`flex max-w-[82%] flex-col rounded-[22px] px-3.5 pb-1.5 pt-2 text-[15px] leading-[1.38] shadow-[0_1px_1px_rgba(0,0,0,0.18)] ${
                    message.sender === 'me'
                      ? isLight
                        ? 'rounded-br-[7px] bg-[#d9fdd3] text-[#111b21]'
                        : 'rounded-br-[7px] bg-[#005c4b] text-[#e9edef]'
                      : isLight
                        ? 'rounded-bl-[7px] bg-white text-[#111b21]'
                        : 'rounded-bl-[7px] bg-[#202c33] text-[#e9edef]'
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words pr-1">{message.text}</span>
                  <span
                    className={`mt-0.5 flex items-center justify-end gap-1 self-end text-[11px] leading-none ${
                      message.sender === 'me'
                        ? isLight
                          ? 'text-[#667781]'
                          : 'text-[#8fc9bd]'
                        : 'text-[#8696a0]'
                    }`}
                  >
                    {message.time}
                    {message.sender === 'me' && <CheckCheck className="size-4 text-[#53bdeb]" strokeWidth={2.05} />}
                  </span>
                </article>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className={`flex items-center gap-1 rounded-[22px] rounded-bl-[7px] px-4 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.18)] ${
                    isLight ? 'bg-white' : 'bg-[#202c33]'
                  }`}
                >
                  <span className="size-2 animate-bounce rounded-full bg-[#8696a0] [animation-delay:-220ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-[#8696a0] [animation-delay:-110ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-[#8696a0]" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Emoji Picker */}
        {emojiOpen && (
          <EmojiPicker
            isLight={isLight}
            onPick={(emoji) => {
              setDraft((d) => d + emoji);
              inputRef.current?.focus();
              requestAnimationFrame(resizeInput);
            }}
          />
        )}

        <footer
          className={`relative grid shrink-0 grid-cols-[minmax(0,1fr)_44px] items-end gap-2 px-2.5 pt-2.5 pb-[calc(max(1rem,env(safe-area-inset-bottom))+0.875rem)] ${
            isLight ? 'bg-[#f0f2f5]' : 'bg-[#202c33]'
          }`}
        >
          {/* Input menu (three dots in bar) */}
          {inputMenuOpen && (
            <div
              className={`absolute bottom-full right-[52px] mb-2 z-50 min-w-[180px] overflow-hidden rounded-2xl border shadow-2xl ${
                isLight ? 'border-black/10 bg-white text-[#111b21]' : 'border-white/10 bg-[#233138] text-[#e9edef]'
              }`}
            >
              <button
                onClick={() => {
                  setInputMenuOpen(false);
                  window.open('https://docs.google.com/forms/d/e/1FAIpQLSdOXbSD4YQMmscuQliFIldNvxayUxxbFO_0OSZkCY42IBc2Gw/viewform?usp=publish-editor', '_blank');
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] transition ${
                  isLight ? 'hover:bg-[#f0f2f5]' : 'hover:bg-[#182229]'
                }`}
              >
                <span className="text-[18px]">📝</span>
                Send Feedback
              </button>
            </div>
          )}

          <div
            className={`flex min-h-11 min-w-0 items-end gap-1 rounded-[24px] px-2 py-1.5 shadow-inner shadow-black/10 ${
              isLight ? 'bg-white' : 'bg-[#2a3942]'
            }`}
          >
            <button
              onClick={() => { setEmojiOpen((v) => !v); setInputMenuOpen(false); }}
              className={`grid size-8 shrink-0 place-items-center rounded-full transition ${
                emojiOpen
                  ? 'bg-[#00a884] text-white'
                  : isLight ? 'text-[#54656f] hover:bg-black/5' : 'text-[#aebac1] hover:bg-white/5'
              }`}
              aria-label="Emoji"
            >
              <Smile className="size-[21px]" strokeWidth={2.05} />
            </button>

            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                requestAnimationFrame(resizeInput);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              rows={1}
              className={`max-h-[118px] min-h-8 min-w-0 flex-1 resize-none self-center bg-transparent py-1.5 text-[16px] leading-[1.35] outline-none ${
                isLight ? 'text-[#111b21] placeholder:text-[#667781]' : 'text-[#e9edef] placeholder:text-[#8696a0]'
              }`}
              spellCheck
            />

            <button
              onClick={() => { setInputMenuOpen((v) => !v); setEmojiOpen(false); }}
              className={`grid size-8 shrink-0 place-items-center rounded-full transition ${
                inputMenuOpen
                  ? 'bg-[#00a884] text-white'
                  : isLight ? 'text-[#54656f] hover:bg-black/5' : 'text-[#aebac1] hover:bg-white/5'
              }`}
              aria-label="More options"
            >
              <MoreVertical className="size-[21px]" strokeWidth={2.05} />
            </button>
          </div>

          <button
            onClick={() => { void handleSend(); setEmojiOpen(false); setInputMenuOpen(false); }}
            disabled={isBusy || !hasDraft}
            className={`grid size-11 shrink-0 place-items-center rounded-full transition ${
              hasDraft
                ? 'bg-[#00a884] text-white shadow-[0_2px_10px_rgba(0,168,132,0.35)] active:scale-95'
                : isLight
                  ? 'bg-[#d1d7db] text-[#54656f]'
                  : 'bg-[#2a3942] text-[#aebac1]'
            }`}
            aria-label="Send message"
          >
            <Send className="ml-0.5 size-5 fill-current" strokeWidth={0} />
          </button>
        </footer>
      </div>


      {dpExpanded && (
        <div
          onClick={() => setDpExpanded(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/85 px-6 backdrop-blur-sm"
        >
          <img
            src={avatarFor(mode, 512)}
            alt={activeMode.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[52dvh] max-w-[72vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[340px] rounded-2xl bg-white/[0.06] px-5 py-4 text-center backdrop-blur-md ring-1 ring-white/10"
          >
            <div className="mb-1 text-[13px] font-semibold uppercase tracking-widest text-white/40">{activeMode.name}</div>
            <p className="text-[15px] leading-[1.6] text-white/85">{MODE_INTROS[mode]}</p>
          </div>
        </div>
      )}

      {gfPromptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-5 backdrop-blur-sm">
          <div
            className={`w-full max-w-[330px] rounded-2xl border p-4 shadow-2xl ${
              isLight ? 'border-black/10 bg-white text-[#111b21]' : 'border-white/10 bg-[#233138] text-[#e9edef]'
            }`}
          >
            <div className="mb-3 text-[17px] font-semibold">Enter password</div>
            <input
              value={gfPassword}
              onChange={(event) => {
                setGfPassword(event.target.value);
                setGfError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void unlockGfMode();
                if (event.key === 'Escape') setGfPromptOpen(false);
              }}
              type="password"
              autoFocus
              className={`h-11 w-full rounded-xl border px-3 text-[15px] outline-none ${
                isLight
                  ? 'border-black/10 bg-[#f0f2f5] text-[#111b21]'
                  : 'border-white/10 bg-[#182229] text-[#e9edef]'
              }`}
            />
            {gfError && <div className="mt-2 text-[13px] text-[#ff6b6b]">{gfError}</div>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setGfPromptOpen(false)}
                className={`rounded-full px-4 py-2 text-[14px] ${isLight ? 'text-[#54656f]' : 'text-[#aebac1]'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => void unlockGfMode()}
                className="rounded-full bg-[#00a884] px-4 py-2 text-[14px] font-semibold text-white"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 max-w-[min(88vw,360px)] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-[13px] text-white shadow-xl backdrop-blur">
          {toast}
        </div>
      )}

      {closingCountdown !== null && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-black/75 px-5 py-3 shadow-2xl backdrop-blur-md ring-1 ring-white/10">
            <div
              className="relative grid size-9 shrink-0 place-items-center"
              style={{ '--cd': closingCountdown } as React.CSSProperties}
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="15" stroke="white" strokeOpacity="0.15" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15"
                  stroke="white" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  strokeDashoffset={`${2 * Math.PI * 15 * (1 - closingCountdown / 5)}`}
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <span className="text-[13px] font-semibold text-white">{closingCountdown}</span>
            </div>
            <span className="text-[13px] text-white/80">Closing chat in <span className="font-semibold text-white">{closingCountdown}s</span></span>
          </div>
        </div>
      )}
    </main>
  );
}
