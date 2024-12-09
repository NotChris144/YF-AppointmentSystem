import React from 'react';
import { Package, Addon } from '../types/appointment';
import { Info, Check } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

interface AddonSelectionProps {
  addons: Addon[];
  selectedPackage?: Package;
  selectedAddons: Addon[];
  onToggle: (addon: Addon) => void;
}

const AddonSelection: React.FC<AddonSelectionProps> = ({
  addons,
  selectedPackage,
  selectedAddons,
  onToggle,
}) => {
  if (!selectedPackage) return null;

  const compatibleAddons = addons.filter(
    (addon) => addon.compatibleSpeeds.includes(selectedPackage.speed)
  );

  const handleToggle = (addon: Addon) => {
    if (addon.id.startsWith('youphone')) {
      // Deselect other phone addons first
      selectedAddons
        .filter(a => a.id.startsWith('youphone') && a.id !== addon.id)
        .forEach(a => onToggle(a));
    }
    // Toggle the selected addon
    onToggle(addon);
  };

  const packagePrice = selectedPackage.salePrice || selectedPackage.price;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add-ons</h2>
        {selectedAddons.length > 0 && (
          <span className="text-sm text-muted">
            {formatPrice(addonsTotal)}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compatibleAddons.map((addon) => {
          const isSelected = selectedAddons.some((a) => a.id === addon.id);
          const isPhoneAddon = addon.id.startsWith('youphone');
          
          return (
            <button
              key={addon.id}
              onClick={() => handleToggle(addon)}
              className={cn(
                "relative flex flex-col w-full p-4 rounded-lg transition-all duration-200 text-left",
                isSelected
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{addon.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
                {!isPhoneAddon && (
                  <div className="group relative">
                    <Info className="w-4 h-4 text-muted hover:text-primary transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 
                                  bg-card border border-border rounded-lg text-sm
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200 shadow-lg z-10">
                      {addon.description}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold">{formatPrice(addon.price)}</span>
                {isPhoneAddon && (
                  <p className="text-sm text-muted mt-1">
                    {addon.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedAddons.length > 0 && (
        <div className="flex justify-between items-center text-sm border-t border-border pt-4">
          <span>Total</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">
              {formatPrice(packagePrice + addonsTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonSelection;