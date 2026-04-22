import { useState } from 'react';
import { Agentation } from 'agentation';
import './SAP.css';

const SCOPES = [
  {
    id: 'local',
    label: 'Local',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'national',
    label: 'National',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <line x1="12" y1="3" x2="12" y2="5" />
        <path d="M5 11V8l3-3h8l3 3v3" />
        <path d="M8 11V9l2-2h4l2 2v2" />
      </svg>
    ),
  },
  {
    id: 'global',
    label: 'Global',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

export default function SAP() {
  const [step, setStep] = useState(1);
  const [issue, setIssue] = useState('');
  const [personal, setPersonal] = useState('');
  const [scope, setScope] = useState(null);

  const canContinueStep1 = issue.trim().length > 0;
  const canContinueStep3 = scope !== null;

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const handleScopeSelect = (id) => {
    setScope(id);
  };

  const handleScopeContinue = () => {
    if (canContinueStep3) setStep(4);
  };

  const restart = () => {
    setStep(1);
    setIssue('');
    setPersonal('');
    setScope(null);
  };

  return (
    <div className="sap-root">
      {/* Progress bar */}
      {step < 4 && (
        <div className="sap-progress">
          <div className="sap-progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="sap-screen">
          <div className="sap-content">
            <h1 className="sap-heading">First, tell us about your issue</h1>
            <p className="sap-subheading">We'll combine your words with our expertise to generate the most impactful petition draft for you.</p>
            <div className="sap-field">
              <label className="sap-label">I want to…</label>
              <textarea
                className="sap-textarea"
                placeholder="Require all public buildings in Sacramento, CA to be wheelchair accessible."
                value={issue}
                onChange={e => setIssue(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="sap-actions">
            <button className="sap-btn-back" disabled>Back</button>
            <button
              className="sap-btn-continue"
              disabled={!canContinueStep1}
              onClick={goNext}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="sap-screen">
          <div className="sap-content">
            <h1 className="sap-heading">One last thing</h1>
            <p className="sap-subheading">Adding a personal story will make the petition stronger.</p>
            <div className="sap-field">
              <label className="sap-label">Why is it personal to you? <span className="sap-optional">(Optional)</span></label>
              <textarea
                className="sap-textarea"
                placeholder="There are no ramps for my sister to get to her classroom at Washington Elementary school"
                value={personal}
                onChange={e => setPersonal(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="sap-actions">
            <button className="sap-btn-back" onClick={goBack}>Back</button>
            <button className="sap-btn-continue" onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="sap-screen">
          <div className="sap-content">
            <h1 className="sap-heading">Lastly, what is the scope of your petition?</h1>
            <div className="sap-scope-grid">
              {SCOPES.map(s => (
                <button
                  key={s.id}
                  className={`sap-scope-card${scope === s.id ? ' selected' : ''}`}
                  onClick={() => handleScopeSelect(s.id)}
                >
                  <span className="sap-scope-icon">{s.icon}</span>
                  <span className="sap-scope-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="sap-actions">
            <button className="sap-btn-back" onClick={goBack}>Back</button>
            <button
              className="sap-btn-continue"
              disabled={!canContinueStep3}
              onClick={handleScopeContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="sap-screen sap-success">
          <div className="sap-content sap-success-content">
            <div className="sap-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="sap-heading">Your petition is ready</h1>
            <p className="sap-subheading">We've drafted a petition based on your answers. Review it below before publishing.</p>

            <div className="sap-summary">
              <div className="sap-summary-row">
                <div className="sap-summary-label">Issue</div>
                <div className="sap-summary-value">{issue}</div>
              </div>
              {personal && (
                <div className="sap-summary-row">
                  <div className="sap-summary-label">Personal story</div>
                  <div className="sap-summary-value">{personal}</div>
                </div>
              )}
              <div className="sap-summary-row">
                <div className="sap-summary-label">Scope</div>
                <div className="sap-summary-value sap-summary-scope">
                  {SCOPES.find(s => s.id === scope)?.label}
                </div>
              </div>
            </div>
          </div>
          <div className="sap-actions sap-success-actions">
            <button className="sap-btn-publish">Publish petition</button>
            <button className="sap-btn-ghost" onClick={restart}>Start over</button>
          </div>
        </div>
      )}

      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </div>
  );
}
