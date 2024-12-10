import React from 'react';
import ToolCard from '../components/ToolCard';
import { Gauge, Calculator } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Tools</h1>
        <p className="mt-2 text-gray-400">Select a tool to get started</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ToolCard
          title="Compare Speeds"
          description="Test and compare download and upload speeds with an interactive speedometer"
          icon={Gauge}
          to="/speed-test"
        />
        <ToolCard
          title="Buyout Calculator"
          description="Calculate contract buyout costs"
          icon={Calculator}
          to="/calculator"
        />
      </div>
    </div>
  );
};

export default HomePage;