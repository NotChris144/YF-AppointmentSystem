import React from 'react';
import { motion } from 'framer-motion';
import { usePriceStore } from '../store/priceStore';
import { cn } from '../lib/utils';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const PriceComparisonCard: React.FC = () => {
  const { monthlyPrice } = usePriceStore();
  const currentPrice = parseFloat(monthlyPrice) || 0;
  const lowestPackage = packages[0];
  const isPriceMatch = currentPrice > 0 && currentPrice < lowestPackage.price;

  const recommendedPackage = packages.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.price - currentPrice);
    const currDiff = Math.abs(curr.price - currentPrice);
    return currDiff < prevDiff ? curr : prev;
  });

  const formatSpeed = (speed: number) => {
    return speed >= 1000 ? `${speed / 1000}Gbps` : `${speed}Mbps`;
  };

  const isCheaper = recommendedPackage.price < currentPrice;
  const priceDiff = Math.abs(currentPrice - recommendedPackage.price);

  return (
    <Link to="/price-comparison">
      <motion.div
        className={cn(
          "relative p-6 rounded-xl border transition-all duration-300",
          "bg-card/50 backdrop-blur-sm cursor-pointer",
          "hover:bg-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10",
          currentPrice > 0 ? "border-primary/20" : "border-border/50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Package Comparison</h3>
            {currentPrice > 0 ? (
              <p className="text-sm text-gray-400">
                Find the perfect package for your needs
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Enter your current bill to see our recommendations
              </p>
            )}
          </div>
          <Zap className="w-5 h-5 text-primary" />
        </div>

        {currentPrice > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="text-sm text-gray-400">Current Bill</div>
              <div className="text-lg font-bold">£{currentPrice.toFixed(2)}</div>
            </div>

            {isPriceMatch ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="text-sm font-medium text-primary mb-2">Price Match Available!</div>
                <p className="text-sm text-gray-400">
                  We can match your current price of £{currentPrice.toFixed(2)} and upgrade you to {formatSpeed(lowestPackage.speed)} speed!
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-baseline">
                  <div className="text-sm text-gray-400">Recommended Package</div>
                  <div className="text-lg font-bold">{formatSpeed(recommendedPackage.speed)}</div>
                </div>

                <div className="flex justify-between items-baseline">
                  <div className="text-sm text-gray-400">Package Price</div>
                  <div className="text-lg font-bold">£{recommendedPackage.price.toFixed(2)}</div>
                </div>

                <div className={cn(
                  "flex justify-between items-baseline",
                  isCheaper ? "text-green-500" : "text-yellow-500"
                )}>
                  <div className="text-sm font-medium">
                    {isCheaper ? "Monthly Savings" : "Extra per Month"}
                  </div>
                  <div className="text-lg font-bold">
                    £{priceDiff.toFixed(2)}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-400">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Compare your current package</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
    </Link>
  );
};

export default PriceComparisonCard;
