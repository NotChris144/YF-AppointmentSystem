import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Router, ArrowRight, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { usePriceStore } from '../store/priceStore';

const packages = [
  {
    speed: 150,
    price: 23.99,
  },
  {
    speed: 500,
    price: 27.99,
  },
  {
    speed: 1000,
    price: 29.99,
  }
];

const formatSpeed = (speed: number) => {
  return speed >= 1000 ? `${speed / 1000}Gbps` : `${speed}Mbps`;
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { monthlyPrice } = usePriceStore();
  const currentPrice = parseFloat(monthlyPrice) || 0;

  const lowestPackage = packages.reduce((prev, curr) => 
    curr.price < prev.price ? curr : prev
  );

  const isPriceMatch = currentPrice > 0 && currentPrice >= lowestPackage.price;

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <h1 className="text-4xl font-bold mb-6">Welcome to Your Freedom</h1>

        <div className="grid gap-6 md:grid-cols-2 flex-1">
          {/* Buyout Calculator Card */}
          <motion.div
            className={cn(
              "flex flex-col rounded-xl border cursor-pointer transition-colors h-full",
              "bg-card/50 backdrop-blur-sm hover:bg-primary/5",
              "border-border/50 hover:border-primary/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/calculator')}
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">Buyout Calculator</h2>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>

              {currentPrice > 0 && (
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-sm text-gray-400 mb-1">Current Monthly Bill</div>
                  <div className="text-2xl font-bold text-primary">£{currentPrice.toFixed(2)}</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Price Comparison Card */}
          <motion.div
            className={cn(
              "flex flex-col rounded-xl border cursor-pointer transition-colors h-full",
              "bg-card/50 backdrop-blur-sm hover:bg-primary/5",
              "border-border/50 hover:border-primary/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/price-comparison')}
          >
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Router className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">Compare Packages</h2>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {isPriceMatch && (
                <div className="mb-4 p-4 rounded-lg bg-primary/10 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <div className="text-sm text-primary font-medium">
                    Price match available at £{currentPrice.toFixed(2)}!
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 flex-1">
                {packages.map((pkg) => {
                  const priceDiff = currentPrice > 0 ? currentPrice - pkg.price : 0;
                  const isCheaper = priceDiff > 0;

                  return (
                    <div key={pkg.speed} className="text-center flex flex-col">
                      <div className="text-lg font-semibold text-primary mb-1">
                        {formatSpeed(pkg.speed)}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        £{pkg.price.toFixed(2)}
                      </div>
                      {currentPrice > 0 && (
                        <div className={cn(
                          "mt-auto text-sm font-medium flex items-center justify-center gap-1",
                          isCheaper ? "text-green-500" : "text-yellow-500"
                        )}>
                          {isCheaper ? (
                            <>
                              <TrendingDown className="w-4 h-4" />
                              Save £{Math.abs(priceDiff).toFixed(2)}
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              +£{Math.abs(priceDiff).toFixed(2)}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;