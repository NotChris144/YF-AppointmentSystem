import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import BuyoutCalculator from '../components/BuyoutCalculator';
import useDevice from '../hooks/useDevice';

const HomePage: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const { isMobile, isTablet, isDesktop } = useDevice();

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
    <div className={`space-y-8 ${isMobile ? 'px-4' : 'px-8'} py-6`}>
      <section className="text-center space-y-4">
        <h1 className={`font-bold ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
          Sales Tools Hub
        </h1>
        <p className={`text-gray-400 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
          Access powerful tools to streamline your sales process
        </p>
      </section>

      <div className={`grid gap-6 ${
        isDesktop 
          ? 'lg:grid-cols-3 md:grid-cols-2' 
          : isTablet 
            ? 'grid-cols-2' 
            : 'grid-cols-1'
      }`}>
        {tools.map((tool) => (
          <div key={tool.id} className="col-span-1">
            <button
              onClick={() => handleToolClick(tool.id)}
              className={`w-full ${
                isMobile ? 'p-4' : 'p-6'
              } bg-card rounded-lg border border-border hover:border-primary transition-colors text-left`}
            >
              <div className="flex items-center gap-3 mb-4">
                <tool.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {tool.title}
                </h2>
              </div>
              <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {tool.description}
              </p>
            </button>
            
            {activeToolId === tool.id && (
              <div className={`mt-4 ${
                isMobile ? 'p-4' : 'p-6'
              } bg-card rounded-lg border border-border ${
                isDesktop ? 'lg:fixed lg:top-24 lg:left-1/2 lg:-translate-x-1/2 lg:w-[800px] lg:max-h-[80vh] lg:overflow-y-auto' : ''
              }`}>
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