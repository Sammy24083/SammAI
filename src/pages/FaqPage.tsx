import React from 'react';
import { FAQ } from '../types';
import { FaqSection } from '../components/FaqSection';
import { HelpCircle } from 'lucide-react';

interface FaqPageProps {
  faqs: FAQ[];
}

export const FaqPage: React.FC<FaqPageProps> = ({ faqs }) => {
  return (
    <div className="py-8 sm:py-14">
      <FaqSection faqs={faqs} />
    </div>
  );
};
