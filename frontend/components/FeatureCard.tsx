import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-5 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-gray-900 font-medium mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
