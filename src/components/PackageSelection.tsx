import React from 'react';
import { Package } from '../types/appointment';
import { Check } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';

interface PackageSelectionProps {
  packages: Package[];
  selectedPackage?: Package;
  onSelect: (pkg: Package) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({
  packages,
  selectedPackage,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Package Selection</h2>
        {selectedPackage && (
          <span className="text-sm text-muted">
            {formatPrice(selectedPackage.salePrice || selectedPackage.price)}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          return (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className={cn(
                "relative flex flex-col p-4 rounded-lg transition-all duration-200",
                isSelected
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              {pkg.salePrice && (
                <span className="absolute -top-2 -right-2 bg-success text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  Sale
                </span>
              )}
              <div className="text-xl font-bold mb-2">
                {pkg.speed} Mbps
              </div>
              <div className="mt-auto flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatPrice(pkg.salePrice || pkg.price)}
                </span>
                {pkg.salePrice && (
                  <span className="text-sm text-muted line-through">
                    {formatPrice(pkg.price)}
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="flex items-center gap-1 text-primary text-sm mt-2">
                  <Check className="w-4 h-4" />
                  <span>Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PackageSelection;