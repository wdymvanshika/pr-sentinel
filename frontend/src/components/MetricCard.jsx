import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MetricCard = ({ 
  label, 
  value, 
  change, 
  trend = 'up', 
  subtitle, 
  icon: Icon, 
  iconColor = '#38bdf8',
  iconBg = 'rgba(56, 189, 248, 0.1)'
}) => {
  // If trend is up and positive for this metric, or down and positive (e.g. fewer issues)
  const isPositive = (trend === 'up' && !label.toLowerCase().includes('issues') && !label.toLowerCase().includes('warnings')) ||
                     (trend === 'down' && (label.toLowerCase().includes('issues') || label.toLowerCase().includes('warnings')));

  return (
    <div className="metric-card glow-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className="metric-icon-box" style={{ background: iconBg, color: iconColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {change && (
          <span className={`metric-trend ${isPositive ? 'trend-up-good' : 'trend-down-bad'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        )}
      </div>

      {subtitle && <div className="metric-footer">{subtitle}</div>}
    </div>
  );
};
