import React from 'react';
import Modal from './ui/Modal';
import { ExternalLink, X, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePriceStore } from '../store/priceStore';

interface RouterDetails {
  name: string;
  speed: number;
  price: number;
  imageUrl: string;
  productUrl: string;
  features: string[];
}

interface RouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  router: RouterDetails;
}

const RouterModal: React.FC<RouterModalProps> = ({
  isOpen,
  onClose,
  router
}) => {
  const { monthlyPrice } = usePriceStore();
  const currentPrice = parseFloat(monthlyPrice) || 0;
  
  const formatSpeed = (speed: number) => {
    return speed >= 1000 ? `${speed / 1000}Gbps` : `${speed}Mbps`;
  };

  const priceDiff = currentPrice > 0 ? currentPrice - router.price : 0;
  const isCheaper = priceDiff > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-background border border-border/50 rounded-xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-background border border-border/50 hover:bg-card/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Router Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square rounded-lg overflow-hidden bg-card/50 flex items-center justify-center p-6">
              <img
                src={router.imageUrl}
                alt={router.name}
                className="w-full h-full object-contain"
                loading="eager"
                onError={(e) => {
                  console.error('Failed to load image:', router.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* Router Details */}
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold">{router.name}</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-primary">
                  {formatSpeed(router.speed)} Package
                </div>
                <div className="text-3xl font-bold">
                  £{router.price.toFixed(2)}
                  <span className="text-sm font-normal text-gray-400 ml-1">/month</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Key Features:</h3>
                <ul className="space-y-2">
                  {router.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="rounded-full w-1.5 h-1.5 bg-primary mt-2" />
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={router.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2",
                  "text-sm text-primary hover:text-primary/80",
                  "transition-colors"
                )}
              >
                View Product Details
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Price Comparison */}
            {currentPrice > 0 && (
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium mt-2 p-3 rounded-lg",
                isCheaper ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"
              )}>
                {isCheaper ? (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Save £{Math.abs(priceDiff).toFixed(2)} per month compared to your current bill
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    £{Math.abs(priceDiff).toFixed(2)} extra per month compared to your current bill
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RouterModal;
