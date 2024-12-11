import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePriceStore } from '../store/priceStore';
import { cn } from '../lib/utils';
import { Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import RouterModal from '../components/RouterModal';

interface Package {
  price: number;
  speed: number;
  unit: string;
  name: string;
  imageUrl: string;
  productUrl: string;
  features: string[];
}

const packages: Package[] = [
  {
    price: 23.99,
    speed: 150,
    unit: 'Mbps',
    name: 'Amazon eero 6',
    imageUrl: '/1GB-_ROUTER.png',
    productUrl: 'https://www.amazon.co.uk/amazon-eero-6/dp/B086PL9KPT/',
    features: [
      'Ideal for homes up to 140 sqm',
      'Supports up to 75+ connected devices',
      'Easy setup with eero app',
      'Automatic updates for security',
      'Built-in Zigbee smart home hub'
    ]
  },
  {
    price: 27.99,
    speed: 500,
    unit: 'Mbps',
    name: 'Amazon eero 6',
    imageUrl: '/1GB-_ROUTER.png',
    productUrl: 'https://www.amazon.co.uk/amazon-eero-6/dp/B086PL9KPT/',
    features: [
      'Ideal for homes up to 140 sqm',
      'Supports up to 75+ connected devices',
      'Easy setup with eero app',
      'Automatic updates for security',
      'Built-in Zigbee smart home hub'
    ]
  },
  {
    price: 29.99,
    speed: 1000,
    unit: 'Mbps',
    name: 'Amazon eero 6',
    imageUrl: '/1GB-_ROUTER.png',
    productUrl: 'https://www.amazon.co.uk/amazon-eero-6/dp/B086PL9KPT/',
    features: [
      'Ideal for homes up to 140 sqm',
      'Supports up to 75+ connected devices',
      'Easy setup with eero app',
      'Automatic updates for security',
      'Built-in Zigbee smart home hub'
    ]
  },
  {
    price: 49.99,
    speed: 2000,
    unit: 'Mbps',
    name: 'ASUS ROG Rapture GT-AXE11000',
    imageUrl: '/2GB_ROUTER.png',
    productUrl: 'https://www.amazon.co.uk/AXE11000-Whole-Home-Tri-band-Coverage-Aggregation/dp/B09VKXRV1C/',
    features: [
      'Triple-level Game Acceleration',
      'WiFi 6E Technology',
      'Tri-band with up to 11000Mbps',
      'ASUS RangeBoost Plus',
      'Commercial-grade security'
    ]
  },
  {
    price: 99.99,
    speed: 8000,
    unit: 'Mbps',
    name: 'ASUS ROG Rapture GT-AXE16000',
    imageUrl: '/8GB_ROUTER.png',
    productUrl: 'https://www.amazon.co.uk/ASUS-GT-AXE16000-quad-band-Triple-level-acceleration/dp/B0B2L5PBPK/',
    features: [
      "World's first quad-band WiFi 6E",
      "Maximized gaming performance",
      "Flagship-grade coverage",
      "Triple-level game acceleration",
      "ASUS AiMesh support"
    ]
  }
];

const PriceComparison: React.FC = () => {
  const { monthlyPrice } = usePriceStore();
  const currentPrice = parseFloat(monthlyPrice) || 0;
  const lowestPackage = packages[0];
  const isPriceMatch = currentPrice > 0 && currentPrice < lowestPackage.price;
  const [selectedRouter, setSelectedRouter] = useState<Package | null>(null);

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
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Our Packages</h1>
          <p className="text-gray-400">Find the perfect package for your needs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to="/calculator"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-card/50 border border-border/50",
              "hover:bg-primary/5 hover:border-primary/20",
              "transition-colors duration-200"
            )}
          >
            Update Bill
          </Link>
        </div>
      </div>

      {currentPrice > 0 && (
        <div className="mb-8">
          <div className="text-xl font-semibold mb-2">Your Current Bill</div>
          <div className="text-3xl font-bold text-primary">£{currentPrice.toFixed(2)}</div>
        </div>
      )}

      {isPriceMatch && (
        <div className="mb-8 bg-primary/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-primary">Price Match Available!</h2>
          </div>
          <p className="text-gray-400">
            Great news! We can match your current price of £{currentPrice.toFixed(2)} and upgrade you to our {formatSpeed(lowestPackage.speed)} package. You'll get faster speeds while keeping your current monthly cost!
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isRecommended = !isPriceMatch && pkg === recommendedPackage;
          const priceDiff = currentPrice > 0 ? currentPrice - pkg.price : 0;
          const isCheaper = priceDiff > 0;

          return (
            <motion.div
              key={pkg.speed}
              className={cn(
                "p-6 rounded-xl border transition-all duration-300",
                "bg-card/50 backdrop-blur-sm cursor-pointer",
                isRecommended && "border-primary/50 bg-primary/5",
                !isRecommended && "border-border/50 hover:border-primary/20 hover:bg-primary/5"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRouter(pkg)}
            >
              {isRecommended && (
                <div className="text-sm font-medium text-primary mb-2">Recommended Package</div>
              )}
              <div className="text-2xl font-bold mb-2">
                {formatSpeed(pkg.speed)}
              </div>
              <div className="text-3xl font-bold mb-4">
                £{pkg.price.toFixed(2)}
                <span className="text-sm font-normal text-gray-400 ml-1">/month</span>
              </div>

              {currentPrice > 0 && !isPriceMatch && (
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium p-3 rounded-lg",
                  isCheaper ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"
                )}>
                  {isCheaper ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      Save £{Math.abs(priceDiff).toFixed(2)} per month
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      £{Math.abs(priceDiff).toFixed(2)} extra per month
                    </>
                  )}
                </div>
              )}

              {isPriceMatch && pkg === lowestPackage && (
                <div className="text-sm text-primary font-medium flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-4 h-4" />
                  Available at your current price!
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {selectedRouter && (
        <RouterModal
          isOpen={selectedRouter !== null}
          onClose={() => setSelectedRouter(null)}
          router={selectedRouter}
        />
      )}
    </div>
  );
};

export default PriceComparison;
