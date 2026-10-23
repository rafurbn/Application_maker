import React from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'banner' | 'rectangle';
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId }) => {
  return (
    <div className="w-full my-6 p-4 rounded-2xl border-2 border-dashed border-slate-200/80 bg-slate-50/50 text-center space-y-1 no-print">
      <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        বিজ্ঞাপন (GOOGLE ADSENSE SLOT - PHASE 2)
      </div>
      <div className="text-xs font-semibold text-slate-500">
        এডসেন্স বিজ্ঞাপন স্লট ({slotId})
      </div>
      <p className="text-[10px] text-slate-400">
        পরবর্তী আপডেটে গুগল এডসেন্স কোড বসানো হবে
      </p>
    </div>
  );
};
