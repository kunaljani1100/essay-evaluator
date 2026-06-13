import { useState } from 'react';
import EvaluationResult from './components/EvaluationResult';
import { evaluateEssay } from './services/evaluateEssay';
import './App.css';

const SAMPLE_TOPIC =
  'Governments should focus on solving today\'s problems rather than trying to solve anticipated future problems.';

function App() {
  const [topic, setTopic] = useState('');
  const [essay, setEssay] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setEvaluation(null);

    if (!topic.trim()) {
      setError('Please enter an essay topic.');
      return;
    }

    if (!essay.trim()) {
      setError('Please enter your essay content.');
      return;
    }

    setLoading(true);

    try {
      const result = await evaluateEssay({ topic: topic.trim(), essay: essay.trim() });
      setEvaluation(result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTopic('');
    setEssay('');
    setEvaluation(null);
    setError('');
  };

  const loadSample = () => {
    setTopic(SAMPLE_TOPIC);
    setEssay('');
    setEvaluation(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">✎</span>
            <div>
              <h1>GRE Essay Evaluator</h1>
              <p>AI-powered feedback using the official ETS Analytical Writing rubric</p>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <form className="essay-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="topic">
              Essay Topic
              <span className="label-hint">Analyze an Issue prompt</span>
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the GRE issue topic or prompt..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <div className="label-row">
              <label htmlFor="essay">
                Essay Content
                <span className="label-hint">Your written response</span>
              </label>
              <span className="word-count">{wordCount} words</span>
            </div>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Paste or type your essay here..."
              rows={16}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Evaluating...
                </>
              ) : (
                'Evaluate Essay'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadSample}
              disabled={loading}
            >
              Load Sample Topic
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {evaluation && <EvaluationResult evaluation={evaluation} />}
      </main>

      <footer className="app-footer">
        <p>
          Scoring based on the{' '}
          <a
            href="https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing/scoring.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            ETS GRE Analytical Writing scoring guide
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
