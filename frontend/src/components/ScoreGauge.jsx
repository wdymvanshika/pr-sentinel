import React from 'react';

export const ScoreGauge = ({ score, grade, size = 96 }) => {
  let ratingClass = 'score-circle-high';

  if (score < 70) {
    ratingClass = 'score-circle-low';
  } else if (score < 85) {
    ratingClass = 'score-circle-med';
  }

  return (
    <div 
      className={`score-circle ${ratingClass}`} 
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="number">{score}</span>
      <span className="label">{grade || (score >= 90 ? 'Grade A' : score >= 80 ? 'Grade B' : 'Grade C')}</span>
    </div>
  );
};
