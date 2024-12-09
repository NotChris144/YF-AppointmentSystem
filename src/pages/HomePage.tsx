import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Wrench } from 'lucide-react';
import BuyoutCalculator from '../components/BuyoutCalculator';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Sales Tools Hub</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Access powerful tools to streamline your sales process
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <BuyoutCalculator />
        </div>
        
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <div className="p-6 bg-card rounded-lg border border-border h-full">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">More Tools Coming Soon</h2>
            </div>
            <p className="text-gray-400">Stay tuned for additional sales tools and calculators.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;