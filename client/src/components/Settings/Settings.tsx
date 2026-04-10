import { Settings as SettingsIcon, X, LogOut, Volume2, VolumeX } from 'lucide-react';
import './Settings.scss';
import { useSettingsStore, type TypingSpeed } from '../../store/useSettingsStore';
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, type FontOption, type FontSizeOption } from '../../../../shared/src/schemas/settings';
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';

const SLEEP_TIMER_OPTIONS = [
  { value: 0,  label: 'Off' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '60m' },
];

const FONT_LABELS: Record<FontOption, string> = {
  'Cormorant Garamond': 'Cormorant',
  'Playfair Display':   'Playfair',
  'EB Garamond':        'EB Garamond',
  'Lora':               'Lora',
  'Merriweather':       'Merriweather',
  'Spectral':           'Spectral',
  'Crimson Pro':        'Crimson',
  'DM Serif Display':   'DM Serif',
};

const FONT_SIZE_LABELS: Record<FontSizeOption, string> = {
  sm: 'Aa',
  md: 'Aa',
  lg: 'Aa',
  xl: 'Aa',
};

const FONT_SIZE_ARIA: Record<FontSizeOption, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'Extra large',
};

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      className={`settings-switch ${on ? 'is-on' : ''}`}
      onClick={onChange}
      role="switch"
      aria-checked={on}
      aria-label={label}
    >
      <span className="settings-switch__track">
        <span className="settings-switch__thumb" />
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-section">
      <h3 className="settings-section__title">{title}</h3>
      <div className="settings-section__body">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row__text">
        <span className="settings-row__label">{label}</span>
        {description && <span className="settings-row__desc">{description}</span>}
      </div>
      {children}
    </div>
  );
}

const TYPING_SPEED_OPTIONS: { value: TypingSpeed; label: string }[] = [
  { value: 'slow',   label: 'Slow'   },
  { value: 'normal', label: 'Normal' },
  { value: 'fast',   label: 'Fast'   },
];

export function Settings() {
  const [open, setOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const { signOut } = useClerk();
  const {
    musicMuted, musicVolume, sleepTimerMinutes,
    font, fontSize, bionicReading,
    typingEnabled, typingSpeed,
    setMusicMuted, setMusicVolume, setSleepTimerMinutes,
    setFont, setFontSize, setBionicReading,
    setTypingEnabled, setTypingSpeed,
  } = useSettingsStore();

  return (
    <>
      <button
        className="settings-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        aria-expanded={open}
      >
        <SettingsIcon size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="settings-overlay"
          role="dialog"
          aria-label="Settings"
          aria-modal
          onClick={() => { setOpen(false); setConfirmingSignOut(false); }}
        >
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-panel__handle" aria-hidden />

            <div className="settings-panel__header">
              <h2 className="settings-panel__title">Settings</h2>
              <button
                className="settings-panel__close"
                onClick={() => { setOpen(false); setConfirmingSignOut(false); }}
                aria-label="Close settings"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="settings-panel__body">
              {/* Font — full width so 4-column grid has room to breathe */}
              <div className="settings-panel__full">
                <Section title="Font">
                  <div className="settings-font-grid">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f}
                        className={`settings-font-card ${font === f ? 'is-selected' : ''}`}
                        onClick={() => setFont(f)}
                        aria-pressed={font === f}
                      >
                        <span
                          className="settings-font-card__name"
                          style={{ fontFamily: `'${f}', Georgia, serif` }}
                        >
                          {FONT_LABELS[f]}
                        </span>
                        <span
                          className="settings-font-card__sample"
                          style={{ fontFamily: `'${f}', Georgia, serif` }}
                        >
                          The tide softens...
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Left column: Sound + Story reveal */}
              <div className="settings-panel__col">
                <Section title="Sound">
                  {/* Music toggle + volume inline */}
                  <div className="settings-music-row">
                    <Toggle
                      on={!musicMuted}
                      onChange={() => setMusicMuted(!musicMuted)}
                      label={musicMuted ? 'Enable ambient music' : 'Mute ambient music'}
                    />
                    <div className={`settings-volume-row ${musicMuted ? 'is-disabled' : ''}`}>
                      {musicVolume === 0
                        ? <VolumeX size={13} strokeWidth={1.5} className="settings-volume-icon" />
                        : <Volume2 size={13} strokeWidth={1.5} className="settings-volume-icon" />
                      }
                      <input
                        type="range"
                        className="settings-volume-slider"
                        min={0}
                        max={1}
                        step={0.01}
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        aria-label="Music volume"
                        disabled={musicMuted}
                        style={{ '--volume-pct': `${Math.round(musicVolume * 100)}%` } as React.CSSProperties}
                      />
                      <span className="settings-volume-pct">{Math.round(musicVolume * 100)}%</span>
                    </div>
                  </div>

                  <div className="settings-block">
                    <span className="settings-block__label">Sleep timer</span>
                    <div className="settings-speed-row">
                      {SLEEP_TIMER_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          className={`settings-speed-btn ${sleepTimerMinutes === value ? 'is-selected' : ''}`}
                          onClick={() => setSleepTimerMinutes(value)}
                          aria-pressed={sleepTimerMinutes === value}
                          aria-label={value === 0 ? 'Sleep timer off' : `Sleep timer ${label}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>

                <Section title="Story reveal">
                  <Row
                    label="Typewriter effect"
                    description="Letters appear gradually"
                  >
                    <Toggle
                      on={typingEnabled}
                      onChange={() => setTypingEnabled(!typingEnabled)}
                      label={typingEnabled ? 'Disable typewriter effect' : 'Enable typewriter effect'}
                    />
                  </Row>

                  <div className={`settings-block ${!typingEnabled ? 'is-disabled' : ''}`}>
                    <span className="settings-block__label">Speed</span>
                    <div className="settings-speed-row">
                      {TYPING_SPEED_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          className={`settings-speed-btn ${typingSpeed === value ? 'is-selected' : ''}`}
                          onClick={() => setTypingSpeed(value)}
                          disabled={!typingEnabled}
                          aria-pressed={typingSpeed === value}
                          aria-label={`${label} typing speed`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>
              </div>

              {/* Right column: Text size + Bionic reading */}
              <div className="settings-panel__col">
                <Section title="Reading">
                  <div className="settings-block">
                    <span className="settings-block__label">Text size</span>
                    <div className="settings-size-row">
                      {FONT_SIZE_OPTIONS.map((s) => (
                        <button
                          key={s}
                          className={`settings-size-btn ${fontSize === s ? 'is-selected' : ''}`}
                          onClick={() => setFontSize(s)}
                          aria-pressed={fontSize === s}
                          aria-label={FONT_SIZE_ARIA[s]}
                          data-size={s}
                        >
                          {FONT_SIZE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Row
                    label="Bionic reading"
                    description="Bolds the start of each word to guide your eye"
                  >
                    <Toggle
                      on={bionicReading}
                      onChange={() => setBionicReading(!bionicReading)}
                      label={bionicReading ? 'Disable bionic reading' : 'Enable bionic reading'}
                    />
                  </Row>
                </Section>
              </div>

              {/* Footer: sign out spans full width */}
              <div className="settings-panel__footer">
                {confirmingSignOut ? (
                  <div className="settings-signout-confirm">
                    <span className="settings-signout-confirm__label">Sign out?</span>
                    <div className="settings-signout-confirm__actions">
                      <button
                        className="settings-signout-confirm__btn settings-signout-confirm__btn--cancel"
                        onClick={() => setConfirmingSignOut(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="settings-signout-confirm__btn settings-signout-confirm__btn--confirm"
                        onClick={() => signOut()}
                      >
                        Yes, sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="settings-signout"
                    onClick={() => setConfirmingSignOut(true)}
                    aria-label="Sign out"
                  >
                    <LogOut size={14} strokeWidth={1.5} />
                    Sign out
                  </button>
                )}
              </div>
            </div>

            <div className="settings-panel__close-bottom">
              <button onClick={() => setOpen(false)} aria-label="Close settings">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
