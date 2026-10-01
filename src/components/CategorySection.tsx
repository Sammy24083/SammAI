import React from 'react';
import { Bot, Palette, Video, Code2, BookOpen, Flame, ArrowUpRight } from 'lucide-react';
import { Category } from '../types';

interface CategorySectionProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories, onSelectCategory }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'bot':
        return <Bot className="w-6 h-6 text-emerald-400" />;
      case 'palette':
        return <Palette className="w-6 h-6 text-pink-400" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-400" />;
      case 'code':
        return <Code2 className="w-6 h-6 text-blue-400" />;
      case 'book-open':
        return <BookOpen className="w-6 h-6 text-amber-400" />;
      case 'flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      default:
        return <Bot className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <section className="py-12 sm:py-16 border-t border-slate-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              EXPLORE OUR MARKETPLACE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to create, build and grow.
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mt-2 sm:mt-0">
            Hand-picked, verified digital AI software subscriptions with instant delivery across Africa.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className="group p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getIcon(category.icon)}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
