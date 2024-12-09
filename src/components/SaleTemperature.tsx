import React from 'react';
import { Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppointmentStore } from '../store/appointmentStore';
import { calculateTemperature } from '../lib/saleTemperature';
import { cn } from '../lib/utils';

const SaleTemperature: React.FC = () => {
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const { customerInfo, providerDetails, painPoints } = useAppointmentStore();

  const result = calculateTemperature(
    customerInfo,
    providerDetails,
    painPoints
  );

  const colors = {
    cold: 'text-blue-500',
    warm: 'text-warning',
    hot: 'text-success'
  };

  const bgColors = {
    cold: 'bg-blue-500/10',
    warm: 'bg-warning/10',
    hot: 'bg-success/10'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Potential Sale Temperature</h2>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-sm text-muted hover:text-primary flex items-center gap-1"
        >
          {showBreakdown ? (
            <>
              Hide Details
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Details
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className={cn(
        "p-4 rounded-lg border transition-colors",
        bgColors[result.temperature],
        "border-" + result.temperature
      )}>
        <div className="flex items-center space-x-4">
          <Thermometer className={`w-8 h-8 ${colors[result.temperature]}`} />
          <div>
            <div className="text-lg font-semibold capitalize">
              {result.temperature}
              <span className="text-sm font-normal text-muted ml-2">
                ({result.totalScore}/{result.maxScore} points)
              </span>
            </div>
            <div className="text-sm text-muted">
              Based on customer profile and preferences
            </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {result.breakdown.map((score, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{score.category}</span>
                  <span className="font-medium">
                    {score.score}/{score.maxScore}
                  </span>
                </div>
                {score.details && score.details.length > 0 && (
                  <ul className="text-xs text-muted space-y-1">
                    {score.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleTemperature;
