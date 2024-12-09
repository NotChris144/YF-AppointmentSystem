import React from 'react';
import { TVPackage } from '../types/appointment';
import { cn } from '../lib/utils';
import { Check, Info } from 'lucide-react';

interface TVPackageSelectionProps {
  packages: TVPackage[];
  selectedPackages: TVPackage[];
  onToggle: (pkg: TVPackage) => void;
}

const TVPackageSelection: React.FC<TVPackageSelectionProps> = ({
  packages,
  selectedPackages,
  onToggle,
}) => {
  // Group packages by type
  const groupedPackages = packages.reduce((acc, pkg) => {
    if (!acc[pkg.type]) {
      acc[pkg.type] = [];
    }
    acc[pkg.type].push(pkg);
    return acc;
  }, {} as Record<string, TVPackage[]>);

  const typeLabels = {
    entertainment: 'Entertainment',
    sports: 'Sports',
    movies: 'Movies',
    kids: 'Kids',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedPackages).map(([type, pkgs]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-medium">{typeLabels[type as keyof typeof typeLabels]}</h3>
          <div className="grid grid-cols-1 gap-4">
            {pkgs.map((pkg) => {
              const isSelected = selectedPackages.some((p) => p.id === pkg.id);
              return (
                <button
                  key={pkg.id}
                  onClick={() => onToggle(pkg)}
                  className={cn(
                    "relative flex items-center justify-between w-full p-4 rounded-lg transition-all duration-200 text-left",
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    <div>
                      <span className="font-medium">{pkg.name}</span>
                      <p className="text-sm text-muted mt-1">{pkg.description}</p>
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-muted hover:text-primary transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TVPackageSelection;