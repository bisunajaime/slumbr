import Groq from 'groq-sdk';
import { OpenRouter } from '@openrouter/sdk';
import { env } from '../config/env';
import { StoryLength, StoryPov, StoryTheme } from '@slumbr/shared';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// Optional OpenRouter fallback — activated when FALLBACK_API_KEY is set in .env
const openRouter = env.FALLBACK_API_KEY
  ? new OpenRouter({ apiKey: env.FALLBACK_API_KEY })
  : null;

function isRateLimit(err: unknown): boolean {
  // Groq surfaces 429s as an error with status 429
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status: number }).status === 429
  );
}

const THEME_CONTEXTS: Record<StoryTheme, string[]> = {
  forest: [
    'a quiet, ancient forest at night — moss underfoot, distant owls, the slow creak of old trees',
    'a pine forest in soft rain — the smell of wet earth, needles, a stream heard but not seen',
    'a misty forest at dawn — pale light through the canopy, birdsong just beginning',
    'a grove of silver birches in autumn — leaves turning, a hush, woodsmoke drifting from somewhere far off',
  ],
  ocean: [
    'a moonlit ocean shore — the rhythm of gentle waves, salt air, warm sand between the toes',
    'a small boat adrift on a calm bay — oars resting, water lapping, the horizon going soft',
    'a tidal pool at low tide — still water, tiny creatures, kelp drying in the last of the sun',
    'a sea cliff at dusk — the sound of water far below, wind in the grass, the last light fading',
  ],
  cosmos: [
    'drifting through deep space — slow nebulae, distant stars, the weightlessness of silence',
    'lying on a dark hillside watching a meteor shower — cold air, the smell of grass, the sky moving',
    'a space station in slow orbit — Earth turning blue below, the hum of life support, absolute stillness outside',
    'the surface of a moon at night — craters stretching to the horizon, stars without number, no sound at all',
  ],
  cabin: [
    'a warm, candlelit cabin in winter — a crackling fire, snowfall beyond the window, deep stillness',
    'a small stone cottage after rain — wet grass, a lamp in the window, the smell of woodsmoke',
    'a treehouse at night — wind moving in the leaves below, the structure gently swaying, blankets piled up',
    'a mountain hut at first light — mist pressing against the glass, the fire gone to embers, birdsong starting',
  ],
  anime: [
    'a quiet coastal town in late summer — cicadas, warm light on old walls, the smell of the sea',
    'a rooftop at golden hour — soft music drifting up from below, laundry in the breeze, the city going quiet',
    'a countryside train moving through golden fields — the window warm, stations passing slowly, no hurry at all',
    'a small library near closing time — lamplight on old spines, rain outside, the librarian turning off lights one by one',
    'a school rooftop after everyone has left — the town spread out below, clouds moving, the day finally over',
  ],
  fantasy: [
    'a sleeping village under soft lantern light — cobblestones, the hum of old magic, nothing stirring',
    'an old forest where the trees remember — luminescent moss, a path worn smooth by centuries, silence so deep it hums',
    'a river valley in an enchanted realm at dusk — willows trailing in dark water, fireflies just beginning',
    'a wizard\'s tower at the edge of the world — stars through the window, shelves of old things, a candle burning low',
  ],
  brainrot: [
    'an absurd internet dreamscape — rendered slow, soft, and surreal, like a half-remembered meme dissolving into warmth',
    'a glitching void that becomes still — pixelated textures softening into color, the noise fading to a low hum',
    'a liminal loading screen that never loads — ambient music looping gently, shapes slowly resolving into nothing important',
    'a comment section growing quiet — the arguments slowing, the avatars blurring, silence spreading from the bottom up',
  ],
  'horror-lite': [
    'a liminal building after dark — familiar and slightly wrong, but ultimately safe, the kind of place you know from dreams',
    'an empty indoor pool at night — the water perfectly still, lights flickering slowly, the smell of chlorine and old concrete',
    'a long hotel corridor in the small hours — soft carpet underfoot, every door closed, a hum from somewhere structural',
    'a shopping mall after closing — escalators stopped, ambient music still playing to no one, the food court in half-light',
  ],
  mythology: [
    'an ancient realm at rest — marble temples under starlight, gods sleeping, the sea barely breathing',
    'a sacred river at the edge of a myth — reeds whispering, offerings dissolving in the current, the old names fading',
    'a grove where oracles once spoke — stone worn smooth by waiting, laurel trees, a silence that feels deliberate',
    'the halls of an old pantheon emptying for the night — torches guttering, enormous doors swinging shut, the world going still',
  ],
};

const POV_INSTRUCTIONS: Record<StoryPov, string> = {
  second: 'Second-person, present tense — "you notice...", "you feel...", "you breathe..." Address the listener directly as "you".',
  first: 'First-person, present tense — "I notice...", "I feel...", "I breathe..." The narrator speaks as themselves, drawing the listener inward.',
  third: 'Third-person, present tense, using they/them — "they notice...", "they feel...", "they breathe..." Follow a single character softly from the outside.',
};

const LENGTH_CONFIG: Record<StoryLength, { paragraphs: string; maxTokens: number }> = {
  short:  { paragraphs: '6–8',   maxTokens: 1500 },
  medium: { paragraphs: '10–14', maxTokens: 3500 },
  long:   { paragraphs: '16–20', maxTokens: 5500 },
};

function buildSystemPrompt(
  pov: StoryPov,
  withCharacter: boolean,
  withDialogue: boolean,
  storyLength: StoryLength,
  isContinuation: boolean,
): string {
  const povInstruction = withCharacter
    ? 'Third-person, present tense. The story follows a named character you invent. Give them a fitting name in the first paragraph and stay with them throughout — "Mira notices...", "He settles...", etc. The listener watches, not inhabits.'
    : POV_INSTRUCTIONS[pov];

  const dialogueInstruction = withDialogue
    ? `\n- Include natural, back-and-forth conversation between characters throughout the story — full exchanges, not isolated lines. Dialogue should feel like a real, gentle conversation: one character speaks, the other responds, and this can continue for several turns. Keep it slow, warm, and unhurried. Use standard quotation marks. Dialogue must never introduce conflict, urgency, or unresolved tension — only comfort, observation, and quiet connection.`
    : '';

  const { paragraphs } = LENGTH_CONFIG[storyLength];

  if (isContinuation) {
    return `You are continuing a sleep story that was already started. Do NOT write a title — pick up exactly where the story left off and continue seamlessly.

Format:
- Do NOT write a title or heading. Start immediately with the next paragraph of the story.
- Write ${paragraphs} more paragraphs, separated by blank lines.

Rules you must never break:
- No conflict, no tension, no unresolved questions
- No sudden movements, loud events, or surprises
- Sentences get progressively longer as the story develops
- Point of view: ${povInstruction}${dialogueInstruction}
- The final paragraph must reach a natural, complete resting point — trailing off into pure sensation
- Always write the full continuation. Never stop mid-paragraph or mid-sentence.`;
  }

  return `You are a sleep story narrator. Your only purpose is to help the listener fall asleep.

Format:
- First line: a short, poetic title (3–6 words). Nothing else on that line.
- Then a blank line.
- Then the story body, broken into paragraphs separated by blank lines (${paragraphs} paragraphs).

Rules you must never break:
- No conflict, no tension, no unresolved questions
- No sudden movements, loud events, or surprises
- Sentences get progressively longer as the story develops
- Point of view: ${povInstruction}${dialogueInstruction}
- The final paragraph must reach a natural, complete resting point — trailing off into pure sensation
- Always write the full story. Never stop mid-paragraph or mid-sentence.`;
}

function pickContext(theme: StoryTheme): string {
  const options = THEME_CONTEXTS[theme];
  return options[Math.floor(Math.random() * options.length)]!;
}

function buildSettingDescription(themes: StoryTheme[]): string {
  if (themes.length === 1) {
    return pickContext(themes[0]!);
  }
  const contexts = themes.map(pickContext);
  const last = contexts.pop();
  return `a dreamlike blend of: ${contexts.join(', ')} — and ${last}. Weave these worlds together naturally, letting their sensations and atmospheres bleed into one another.`;
}

type ChunkIterable = AsyncIterable<{ choices: Array<{ delta: { content?: string | null } }> }>;

async function streamFromIterable(source: ChunkIterable): Promise<ReadableStream<string>> {
  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of source) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(text);
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function generateStory(
  themes: StoryTheme[],
  pov: StoryPov,
  withCharacter: boolean,
  withDialogue: boolean,
  storyLength: StoryLength,
  customPrompt?: string,
  continuationContext?: string,
): Promise<{ stream: ReadableStream<string>; provider: string }> {
  const isContinuation = !!continuationContext;
  const setting = buildSettingDescription(themes);
  const extra = customPrompt ? `\n\nAdditional direction from the listener: ${customPrompt}` : '';
  const userContent = isContinuation
    ? `The story so far ended with:\n\n${continuationContext}\n\nContinue the story now — no title, just the next paragraphs flowing naturally from where it left off.`
    : `Setting: ${setting}${extra}\n\nWrite the complete sleep story now — title first, then all paragraphs through to a gentle, finished ending.`;

  const { maxTokens } = LENGTH_CONFIG[storyLength];
  const messages = [
    { role: 'system' as const, content: buildSystemPrompt(pov, withCharacter, withDialogue, storyLength, isContinuation) },
    { role: 'user' as const, content: userContent },
  ];

  // ── Primary: OpenRouter / Gemini ─────────────────────────────────────────
  if (openRouter) {
    try {
      const orStream = await openRouter.chat.send({
        httpReferer: 'https://slumbr.app',
        appTitle: 'Slumbr',
        chatRequest: {
          model: env.FALLBACK_MODEL ?? 'google/gemini-2.0-flash-001',
          messages,
          stream: true as const,
          maxTokens: maxTokens,
          temperature: 0.8,
        },
      });
      return { stream: await streamFromIterable(orStream), provider: 'openrouter' };
    } catch (err) {
      if (!isRateLimit(err)) throw err;
      console.warn('[story] OpenRouter rate-limited — trying Groq');
    }
  }

  // ── Fallback 1: Groq llama-3.3-70b ───────────────────────────────────────
  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.8,
    });
    return { stream: await streamFromIterable(stream), provider: 'groq' };
  } catch (err) {
    if (!isRateLimit(err)) throw err;
    console.warn('[story] Groq primary rate-limited — trying Groq fallback model');
  }

  // ── Fallback 2: Groq smaller model ───────────────────────────────────────
  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    stream: true,
    max_tokens: maxTokens,
    temperature: 0.8,
  });
  return { stream: await streamFromIterable(stream), provider: 'groq-fallback' };
}
