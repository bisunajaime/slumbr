import './Home.scss';
import { useState, useEffect } from 'react';
import { StoryTypeSelector } from '../components/StoryTypeSelector/StoryTypeSelector';
import { StoryHistory } from '../components/StoryHistory/StoryHistory';
import { useStoryStore } from '../store/useStoryStore';
import { useStoryActions } from '../hooks/useStoryActions';
import { type StoryLength, type StoryPov } from '../../../shared/src/schemas/story';

const LENGTH_OPTIONS: { value: StoryLength; label: string; readTime: string }[] = [
  { value: 'short',  label: 'Short',  readTime: '~4 min' },
  { value: 'medium', label: 'Medium', readTime: '~8 min' },
  { value: 'long',   label: 'Long',   readTime: '~12 min' },
];

const POV_OPTIONS: { value: StoryPov; label: string; description: string; example: string }[] = [
  {
    value:       'first',
    label:       'First person',
    description: 'Personal & inward',
    example:     '"I feel the warmth settle..."',
  },
  {
    value:       'second',
    label:       'Second person',
    description: 'Immersive & present',
    example:     '"You notice the stillness..."',
  },
  {
    value:       'third',
    label:       'Third person',
    description: 'Quiet & observed',
    example:     '"They breathe, slowly..."',
  },
];

const PROMPT_EXAMPLES = [
  'a traveler finding shelter from the rain...',
  'make me a lighthouse keeper drifting off...',
  'set the story underwater, near glowing jellyfish...',
  'a character who falls asleep reading in a library...',
  'make it feel like floating in warm, still water...',
  'a botanist tending to a moonlit greenhouse...',
  'slow it down even more than usual...',
  'a shepherd watching stars from a hillside...',
];

function useCyclingPlaceholder(items: string[], interval = 3500) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, 400);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return { text: items[index]!, visible };
}

export function Home() {
  const { selectedThemes, pov, withCharacter, withDialogue, storyLength, customPrompt, status, setCustomPrompt, setPov, toggleCharacter, toggleDialogue, setStoryLength } = useStoryStore();
  const { generate } = useStoryActions();
  const canGenerate = selectedThemes.length > 0 && status === 'idle';
  const isLoading = status === 'loading';

  const currentLength = LENGTH_OPTIONS.find((o) => o.value === storyLength) ?? LENGTH_OPTIONS[1]!;

  const handleGenerate = () => {
    if (selectedThemes.length === 0) return;
    generate(selectedThemes, pov, withCharacter, withDialogue, storyLength, customPrompt);
  };

  const placeholder = useCyclingPlaceholder(PROMPT_EXAMPLES);

  return (
    <main className="home">
      <header className="home__header">
        <h1 className="home__wordmark">slumbr</h1>
        <p className="home__tagline">a story to fall asleep to</p>
      </header>

      <StoryTypeSelector />

      <div className={`home__pov ${withCharacter ? 'is-overridden' : ''}`}>
        <span className="home__pov-label">
          perspective
          {withCharacter && <span className="home__pov-override-note">follows the character</span>}
        </span>
        <div className="home__pov-grid" role="group" aria-label="Point of view">
          {POV_OPTIONS.map(({ value, label, description, example }) => (
            <button
              key={value}
              className={`home__pov-card ${pov === value ? 'is-active' : ''}`}
              onClick={() => setPov(value)}
              aria-pressed={pov === value}
            >
              <span className="home__pov-card-label">{label}</span>
              <span className="home__pov-card-desc">{description}</span>
              <span className="home__pov-card-example">{example}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="home__extras">
        <div className="home__extras-row">
          <span className="home__extras-label">character</span>
          <button
            className={`home__extras-toggle ${withCharacter ? 'is-active' : ''}`}
            onClick={toggleCharacter}
            disabled={pov === 'first'}
            aria-pressed={withCharacter}
            title={pov === 'first' ? 'Not available in first person' : undefined}
          >
            <span className="home__extras-toggle-dot" />
            {withCharacter ? 'with a character' : 'no character'}
          </button>
          {pov === 'first' && (
            <span className="home__extras-hint">not in first person</span>
          )}
        </div>

        <div className="home__extras-row">
          <span className="home__extras-label">length</span>
          <div className="home__length-pills">
            {LENGTH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`home__length-pill ${storyLength === value ? 'is-active' : ''}`}
                onClick={() => setStoryLength(value)}
                aria-pressed={storyLength === value}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="home__extras-hint home__extras-hint--amber">{currentLength.readTime}</span>
        </div>

        <div className="home__extras-row">
          <span className="home__extras-label">dialogue</span>
          <button
            className={`home__extras-toggle ${withDialogue ? 'is-active' : ''}`}
            onClick={toggleDialogue}
            aria-pressed={withDialogue}
          >
            <span className="home__extras-toggle-dot" />
            {withDialogue ? 'characters speak' : 'no dialogue'}
          </button>
          {withDialogue && (
            <span className="home__extras-hint home__extras-hint--amber">
              characters speak throughout
            </span>
          )}
        </div>
      </div>

      <div className="home__prompt">
        <label className="home__prompt-label">add a detail <span>(optional)</span></label>
        <div className="home__prompt-field">
          <textarea
            className="home__prompt-input"
            placeholder={placeholder.text}
            data-placeholder-visible={placeholder.visible}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength={500}
            rows={2}
          />
        </div>
      </div>

      <button
        className={`home__generate ${canGenerate ? 'is-ready' : ''} ${isLoading ? 'is-loading' : ''}`}
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
        aria-label={isLoading ? 'Generating story…' : 'Generate story'}
      >
        {isLoading
          ? <span className="home__generate-dots"><span /><span /><span /></span>
          : 'Begin'
        }
      </button>

      <div className="home__divider" />

      <StoryHistory />
    </main>
  );
}
