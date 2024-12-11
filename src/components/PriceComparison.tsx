import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePriceStore } from '../store/priceStore';
import { cn } from '../lib/utils';
import { Zap } from 'lucide-react';

interface Package {
  price: number;
  speed: number;
  unit: string;
}

const packages: Package[] = [
  { price: 23.99, speed: 150, unit: 'Mbps' },
  { price: 27.99, speed: 500, unit: 'Mbps' },
  { price: 29.99, speed: 1000, unit: 'Mbps' },
  { price: 49.99, speed: 2000, unit: 'Mbps' },
  { price: 99.99, speed: 8000, unit: 'Mbps' },
];

const PriceComparison: React.FC = () => {
  const { monthlyPrice } = usePriceStore();
  const currentPrice = parseFloat(monthlyPrice) || 0;

  const recommendedPackage = useMemo(() => {
    return packages.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.price - currentPrice);
      const currDiff = Math.abs(curr.price - currentPrice);
      return currDiff < prevDiff ? curr : prev;
    });
  }, [currentPrice]);

  const formatSpeed = (speed: number) => {
    return speed >= 1000 ? `${speed / 1000}Gbps` : `${speed}Mbps`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Package Comparison</h2>
        <div className="text-right">
          <div className="text-sm text-gray-400">Current Monthly Bill</div>
          <div className="text-xl font-bold">£{currentPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isRecommended = pkg === recommendedPackage;
          const isCheaper = pkg.price < currentPrice;

          return (
            <motion.div
              key={pkg.speed}
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-300",
                "bg-card/50 backdrop-blur-sm",
                isRecommended ? [
                  "border-primary",
                  "bg-primary/5",
                  "shadow-lg shadow-primary/10",
                ] : [
                  "border-border/50",
                  "hover:border-primary/20",
                  "hover:bg-primary/5",
                ]
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
                  Recommended
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">£{pkg.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">per month</div>
                </div>
                <Zap 
                  className={cn(
                    "w-6 h-6",
                    isRecommended ? "text-primary" : "text-gray-400"
                  )} 
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold">{formatSpeed(pkg.speed)}</div>
                  <div className="text-sm text-gray-400">Download Speed</div>
                </div>

                {currentPrice > 0 && (
                  <div className={cn(
                    "text-sm font-medium",
                    isCheaper ? "text-green-500" : "text-yellow-500"
                  )}>
                    {isCheaper 
                      ? `Save £${(currentPrice - pkg.price).toFixed(2)} per month`
                      : `£${(pkg.price - currentPrice).toFixed(2)} more per month`
                    }
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceComparison;
