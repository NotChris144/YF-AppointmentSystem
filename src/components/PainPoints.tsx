import React from 'react';
import { AlertTriangle, Zap, PoundSterling, Lock } from 'lucide-react';

interface PainPoint {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const painPoints: PainPoint[] = [
  {
    id: 'cost',
    icon: <PoundSterling className="w-5 h-5" />,
    title: 'High Costs',
    description: 'Current package costs more than our competitive offers',
  },
  {
    id: 'speed',
    icon: <Zap className="w-5 h-5" />,
    title: 'Slow Speeds',
    description: 'Experiencing slower speeds than what they are paying for',
  },
  {
    id: 'reliability',
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Unreliable Service',
    description: 'Frequent disconnections or service interruptions',
  },
  {
    id: 'contract',
    icon: <Lock className="w-5 h-5" />,
    title: 'Contract Flexibility',
    description: 'Locked into long-term contracts with limited options',
  },
];

interface PainPointsProps {
  selectedPoints: string[];
  onToggle: (id: string) => void;
}

const PainPoints: React.FC<PainPointsProps> = ({ selectedPoints, onToggle }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Common Pain Points</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {painPoints.map((point) => {
          const isSelected = selectedPoints.includes(point.id);
          return (
            <button
              key={point.id}
              onClick={() => onToggle(point.id)}
              className={`p-4 rounded-lg border ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              } transition-colors text-left`}
            >
              <div className="flex items-start space-x-3">
                <div className={`${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                  {point.icon}
                </div>
                <div>
                  <h3 className="font-medium">{point.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{point.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PainPoints;