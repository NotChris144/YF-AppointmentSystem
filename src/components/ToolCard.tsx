import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, to }) => {
  return (
    <Link
      to={to}
      className="block group"
    >
      <div className="relative p-6 bg-gray-800 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500/20">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ToolCard;
