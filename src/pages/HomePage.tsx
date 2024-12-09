import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import BuyoutCalculator from '../components/BuyoutCalculator';

const HomePage: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const tools = [
    {
      id: 'buyout-calculator',
      title: 'Buyout Calculator',
      description: 'Calculate contract buyout costs and savings',
      icon: Calculator,
      component: BuyoutCalculator
    },
    // More tools can be added here
  ];

  const handleToolClick = (toolId: string) => {
    setActiveToolId(activeToolId === toolId ? null : toolId);
  };

  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Sales Tools Hub</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Access powerful tools to streamline your sales process
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="col-span-1">
            <button
              onClick={() => handleToolClick(tool.id)}
              className="w-full p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <tool.icon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">{tool.title}</h2>
              </div>
              <p className="text-gray-400">{tool.description}</p>
            </button>
            
            {activeToolId === tool.id && (
              <div className="mt-4 p-6 bg-card rounded-lg border border-border">
                <tool.component />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;