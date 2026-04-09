import './StoryTypeSelector.scss';
import { STORY_THEMES, type StoryTheme } from '../../../../shared/src/schemas/story';
import { useStoryStore } from '../../store/useStoryStore';

const THEME_META: Record<StoryTheme, { label: string; icon: string; mood: string }> = {
  forest:        { label: 'Forest',    icon: '🌲', mood: 'pine · dew · hush'     },
  ocean:         { label: 'Ocean',     icon: '🌊', mood: 'tide · salt · depth'   },
  cosmos:        { label: 'Cosmos',    icon: '✨', mood: 'stars · void · drift'  },
  cabin:         { label: 'Cabin',     icon: '🪵', mood: 'warmth · wood · ember' },
  anime:         { label: 'Anime',     icon: '🌸', mood: 'petals · soft · still' },
  fantasy:       { label: 'Fantasy',   icon: '🌙', mood: 'mist · old magic · fog'},
  brainrot:      { label: 'Brainrot',  icon: '🌀', mood: 'loop · drift · surreal'},
  'horror-lite': { label: 'Liminal',   icon: '🚪', mood: 'still · unseen · dim'  },
  mythology:     { label: 'Mythology', icon: '🏛️', mood: 'ancient · stone · lore'},
};

export function StoryTypeSelector() {
  const selectedThemes = useStoryStore((s) => s.selectedThemes);
  const toggleTheme    = useStoryStore((s) => s.toggleTheme);

  return (
    <div className="theme-selector">
      <div className="theme-selector__grid" role="group" aria-label="Story themes">
        {STORY_THEMES.map((theme) => {
          const { label, icon, mood } = THEME_META[theme];
          const selected = selectedThemes.includes(theme);
          const order    = selectedThemes.indexOf(theme);

          return (
            <button
              key={theme}
              className={`theme-tile ${selected ? 'is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => toggleTheme(theme)}
            >
              {selected && (
                <span className="theme-tile__badge" aria-hidden>
                  {order + 1}
                </span>
              )}
              <span className="theme-tile__icon" aria-hidden>{icon}</span>
              <span className="theme-tile__label">{label}</span>
              <span className="theme-tile__mood" aria-hidden>{mood}</span>
            </button>
          );
        })}
      </div>

      <div className="theme-selector__footer" aria-live="polite">
        {selectedThemes.length === 0 && (
          <span className="theme-selector__prompt">choose a theme to begin</span>
        )}
        {selectedThemes.length === 1 && (
          <span className="theme-selector__single">
            {THEME_META[selectedThemes[0]!].mood}
          </span>
        )}
        {selectedThemes.length > 1 && (
          <span className="theme-selector__blend">
            blending {selectedThemes.length} themes
          </span>
        )}
      </div>
    </div>
  );
}
