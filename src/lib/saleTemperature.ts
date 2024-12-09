import { differenceInMonths, isSameMonth } from 'date-fns';
import type { CustomerInfo, ProviderDetails, AppointmentType, Temperature } from '../types/appointment';
import type { Package } from '../types/packages';
import { packages } from '../data/packages';

interface SaleScore {
  category: string;
  score: number;
  maxScore: number;
  details: string[];
}

interface TemperatureResult {
  totalScore: number;
  maxScore: number;
  temperature: Temperature;
  breakdown: SaleScore[];
}

const calculateCustomerScore = (customerInfo: Partial<CustomerInfo>): SaleScore => {
  let score = 0;
  const details: string[] = [];

  if (customerInfo.firstName && customerInfo.lastName) {
    score += 1;
    details.push('Complete customer name provided');
  }

  if (customerInfo.contactValue) {
    score += 1;
    details.push(`${customerInfo.contactType === 'email' ? 'Email' : 'Phone'} contact provided`);
  }

  if (customerInfo.address && customerInfo.postcode) {
    score += 1;
    details.push('Full address provided');
  }

  return {
    category: 'Customer Information',
    score,
    maxScore: 3,
    details
  };
};

const calculateContractBuyoutScore = (
  currentPrice: number | undefined,
  selectedPackage: Package | undefined,
  contractEnd?: Date,
  type: AppointmentType = 'lead'
): SaleScore => {
  let score = 0;
  const details: string[] = [];

  if (currentPrice && selectedPackage && contractEnd) {
    const proposedPrice = selectedPackage.salePrice || selectedPackage.price;
    const monthlySaving = currentPrice - proposedPrice;
    
    const today = new Date();
    let monthsLeft = differenceInMonths(contractEnd, today);
    if (!isSameMonth(today, contractEnd)) {
      monthsLeft += 1;
    }
    monthsLeft = Math.max(0, monthsLeft);
    
    const totalContractCost = monthsLeft * currentPrice;
    const discountedBuyout = totalContractCost * 0.8;
    const maxBuyout = 300;
    const canFullyBuyout = discountedBuyout <= maxBuyout;

    // Always award a point if we can fully buyout the contract
    if (canFullyBuyout) {
      score = 1;
      details.push('Full contract buyout available');
      if (monthlySaving > 0) {
        details.push(`Monthly savings: £${monthlySaving.toFixed(2)}`);
      }
    } else {
      const customerContribution = discountedBuyout - maxBuyout;
      const monthlyContribution = customerContribution / monthsLeft;
      const netSavings = monthlySaving - monthlyContribution;
      
      details.push('Partial buyout required');
      if (netSavings > 0) {
        details.push(`Monthly savings: £${netSavings.toFixed(2)} after buyout contribution`);
      }
    }
  }

  return {
    category: 'Contract Buyout',
    score,
    maxScore: 1,
    details
  };
};

const calculateSpeedScore = (
  providerDetails: Partial<ProviderDetails>,
  type: AppointmentType = 'revisit'
): SaleScore => {
  let score = 0;
  const details: string[] = [];

  const actualSpeed = providerDetails.estimatedSpeed || 0;
  const promisedSpeed = providerDetails.speed || 0;

  // Score based on speed difference from promised
  if (promisedSpeed > 0 && actualSpeed > 0) {
    const speedDifference = ((promisedSpeed - actualSpeed) / promisedSpeed) * 100;

    if (type === 'revisit') {
      if (speedDifference >= 50) {
        score += 2;
        details.push(`Getting ${speedDifference.toFixed(0)}% less than promised speed`);
      } else if (speedDifference >= 25) {
        score += 1;
        details.push(`Getting ${speedDifference.toFixed(0)}% less than promised speed`);
      }
    }
  }

  // Score based on speed improvement potential
  const availablePackages = packages.filter(pkg => pkg.speed > actualSpeed);
  if (availablePackages.length > 0) {
    const bestPackage = availablePackages.reduce((best, current) => 
      current.speed > best.speed ? current : best
    );

    if (bestPackage.speed > actualSpeed * 5) {
      score += 2;
      details.push(`Can offer ${(bestPackage.speed / actualSpeed).toFixed(0)}x faster speeds`);
    } else if (bestPackage.speed > actualSpeed * 2) {
      score += 1;
      details.push(`Can offer ${(bestPackage.speed / actualSpeed).toFixed(0)}x faster speeds`);
    }
  }

  return {
    category: 'Speed Comparison',
    score,
    maxScore: 4,
    details
  };
};

const calculatePriceScore = (
  currentPrice: number | undefined,
  type: AppointmentType = 'revisit'
): SaleScore => {
  let score = 0;
  const details: string[] = [];

  if (currentPrice) {
    // Find packages that are cheaper and offer better value
    const affordablePackages = packages.filter(pkg => 
      (pkg.salePrice || pkg.price) < currentPrice
    );

    if (affordablePackages.length > 0) {
      const bestPackage = affordablePackages.reduce((best, current) => 
        (current.salePrice || current.price) < (best.salePrice || best.price) ? current : best
      );

      const proposedPrice = bestPackage.salePrice || bestPackage.price;
      const saving = currentPrice - proposedPrice;
      const savingPercentage = (saving / currentPrice) * 100;

      if (type === 'revisit') {
        if (saving >= 10 || savingPercentage >= 25) {
          score += 2;
          details.push(`Currently paying: £${currentPrice.toFixed(2)}`);
          details.push(`Our price: £${proposedPrice.toFixed(2)} (£${saving.toFixed(2)} monthly saving)`);
        } else if (saving >= 5 || savingPercentage >= 10) {
          score += 1;
          details.push(`Monthly savings of £${saving.toFixed(2)} available`);
        }
      }
    }
  }

  return {
    category: 'Price Comparison',
    score,
    maxScore: 2,
    details
  };
};

const calculatePainPointsScore = (painPoints: string[]): SaleScore => {
  return {
    category: 'Pain Points',
    score: Math.min(painPoints.length, 2),
    maxScore: 2,
    details: painPoints.length > 0 
      ? [`${painPoints.length} pain point${painPoints.length === 1 ? '' : 's'} identified`]
      : []
  };
};

export const calculateTemperature = (
  customerInfo: Partial<CustomerInfo>,
  providerDetails: Partial<ProviderDetails>,
  painPoints: string[],
  type: AppointmentType = 'revisit'
): TemperatureResult => {
  const scores = [
    calculateCustomerScore(customerInfo),
    calculateContractBuyoutScore(providerDetails.price, undefined, providerDetails.contractEnd, type),
    calculateSpeedScore(providerDetails, type),
    calculatePriceScore(providerDetails.price, type),
    calculatePainPointsScore(painPoints)
  ];

  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const maxScore = scores.reduce((sum, score) => sum + score.maxScore, 0);
  const percentage = (totalScore / maxScore) * 100;

  return {
    totalScore,
    maxScore,
    temperature: percentage >= 80 ? 'hot' : percentage >= 50 ? 'warm' : 'cold',
    breakdown: scores
  };
};
