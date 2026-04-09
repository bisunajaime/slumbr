import { Settings as SettingsIcon, X, LogOut } from 'lucide-react';
import './Settings.scss';
import { useSettingsStore, type TypingSpeed } from '../../store/useSettingsStore';
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, type FontOption, type FontSizeOption } from '../../../../shared/src/schemas/settings';
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';

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
    musicMuted, font, fontSize, bionicReading,
    typingEnabled, typingSpeed,
    setMusicMuted, setFont, setFontSize, setBionicReading,
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
              <Section title="Sound">
                <Row label="Ambient music">
                  <Toggle
                    on={!musicMuted}
                    onChange={() => setMusicMuted(!musicMuted)}
                    label={musicMuted ? 'Enable ambient music' : 'Mute ambient music'}
                  />
                </Row>
              </Section>

              <Section title="Reading">
                {/* Font */}
                <div className="settings-block">
                  <span className="settings-block__label">Font</span>
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
                </div>

                {/* Font size */}
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

                {/* Bionic reading */}
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

              <Section title="Story reveal">
                <Row
                  label="Typewriter effect"
                  description="Letters appear gradually as the story unfolds"
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
