
import React from 'react';
import { AIInsight } from '../types';
import { ICONS } from '../constants';

interface AIInsightPanelProps {
  insights: AIInsight[];
  loading: boolean;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ insights, loading }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#2DD4BF]/10 p-2 rounded-lg text-[#2DD4BF]">
          <ICONS.Sparkles />
        </div>
        <h3 className="font-bold text-lg text-white">IA cifra.ia</h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-24 bg-[#1F2937]/50 rounded-2xl w-full"></div>
          <div className="h-24 bg-[#1F2937]/50 rounded-2xl w-full"></div>
        </div>
      ) : insights.length > 0 ? (
        insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-2xl border ${
              insight.type === 'alert' ? 'bg-red-500/5 border-red-500/20' : 
              insight.type === 'success' ? 'bg-[#2DD4BF]/5 border-[#2DD4BF]/20' : 
              'bg-blue-500/5 border-blue-500/20'
            }`}
          >
            <h4 className={`font-bold text-sm mb-1 ${
              insight.type === 'alert' ? 'text-red-400' : 
              insight.type === 'success' ? 'text-[#2DD4BF]' : 
              'text-blue-400'
            }`}>
              {insight.title}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">{insight.description}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-sm">Adicione mais transações para gerar insights precisos.</p>
      )}
    </div>
  );
};

export default AIInsightPanel;
