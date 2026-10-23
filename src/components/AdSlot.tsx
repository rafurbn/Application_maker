import { useEffect } from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'auto' | 'banner' | 'rectangle';
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Phase 2-এর বিজ্ঞাপন স্লট। VITE_ADSENSE_CLIENT না দেওয়া পর্যন্ত কিছুই রেন্ডার হয় না —
 * ইউজারকে "শীঘ্রই আসছে" বক্স দেখানো হয় না, আর AdSense-এর নীতিমতো খালি স্লটও থাকে না।
 */
export function AdSlot({ slotId, format = 'auto' }: AdSlotProps) {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    if (!document.getElementById('adsbygoogle-js')) {
      const script = document.createElement('script');
      script.id = 'adsbygoogle-js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(script);
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense এখনো অনুমোদিত নয় বা ব্লকড — স্লট ফাঁকা থাকে */
    }
  }, []);

  if (!ADSENSE_CLIENT) return null;

  return (
    <div className="w-full my-6 text-center no-print">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
