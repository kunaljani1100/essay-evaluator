function ScoreBadge({ score, label }) {
  const getScoreColor = (value) => {
    if (value >= 5.5) return 'score-outstanding';
    if (value >= 4.5) return 'score-strong';
    if (value >= 3.5) return 'score-adequate';
    if (value >= 2.5) return 'score-limited';
    return 'score-flawed';
  };

  return (
    <div className={`score-badge ${getScoreColor(score)}`}>
      <span className="score-value">{score}</span>
      <span className="score-max">/ 6</span>
      {label && <span className="score-label">{label}</span>}
    </div>
  );
}

function CriteriaCard({ title, content }) {
  return (
    <div className="criteria-card">
      <h4>{title}</h4>
      <p>{content}</p>
    </div>
  );
}

function EvaluationResult({ evaluation }) {
  const {
    score,
    scoreLabel,
    summary,
    strengths = [],
    areasForImprovement = [],
    criteria = {},
  } = evaluation;

  return (
    <section className="evaluation-result" aria-live="polite">
      <div className="result-header">
        <h2>Evaluation Results</h2>
        <ScoreBadge score={score} label={scoreLabel} />
      </div>

      <p className="result-summary">{summary}</p>

      <div className="result-columns">
        <div className="result-panel strengths">
          <h3>Strengths</h3>
          <ul>
            {strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="result-panel improvements">
          <h3>Areas for Improvement</h3>
          <ul>
            {areasForImprovement.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="criteria-grid">
        <CriteriaCard title="Position" content={criteria.position} />
        <CriteriaCard title="Development & Support" content={criteria.development} />
        <CriteriaCard title="Organization" content={criteria.organization} />
        <CriteriaCard title="Language & Style" content={criteria.language} />
        <CriteriaCard title="Grammar & Mechanics" content={criteria.mechanics} />
      </div>

      <p className="rubric-note">
        Scored using the official{' '}
        <a
          href="https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing/scoring.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          ETS GRE Analytical Writing rubric
        </a>
        . Scores range from 0 to 6 in half-point increments.
      </p>
    </section>
  );
}

export default EvaluationResult;
