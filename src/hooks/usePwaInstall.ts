import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/** যে ডিভাইসে ইনস্টল-গাইড দেখাতে হবে — প্রতিটির ধাপ আলাদা। */
export type InstallGuideKind = 'ios' | 'android' | 'desktop';

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function detectGuideDevice(): { kind: InstallGuideKind; browser: string; label: string; canAutoInstall: boolean } {
  const ua = window.navigator.userAgent;
  const lower = ua.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(lower) || (/macintosh/.test(lower) && (window.navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1);
  const isAndroid = /android/.test(lower);
  // Android ও ডেস্কটপে Chrome/Edge-এ beforeinstallprompt আসে; Firefox/Opera-তে আসে না।
  const isSamsung = /samsungbrowser/.test(lower);
  const isFirefox = /firefox|fxios/.test(lower);
  const isOpera = /opr\//.test(lower);

  if (isIos) {
    return {
      kind: 'ios',
      browser: 'Safari',
      label: 'iPhone / iPad',
      canAutoInstall: false,
    };
  }
  if (isAndroid) {
    if (isSamsung) {
      return { kind: 'android', browser: 'Samsung Internet', label: 'Samsung Galaxy ফোন', canAutoInstall: true };
    }
    if (isFirefox) {
      return { kind: 'android', browser: 'Firefox', label: 'Android ফোন', canAutoInstall: false };
    }
    return { kind: 'android', browser: isOpera ? 'Opera' : 'Chrome', label: 'Android ফোন', canAutoInstall: true };
  }
  return { kind: 'desktop', browser: 'Chrome / Edge', label: 'কম্পিউটার (Windows / Mac)', canAutoInstall: true };
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [guideKind, setGuideKind] = useState<InstallGuideKind>('desktop');
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // ইতিমধ্যে ইনস্টল করা অ্যাপ থেকে খোলা হলে (iOS-এ navigator.standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const device = detectGuideDevice();
    setGuideKind(device.kind);

    // in-app ব্রাউজার (Facebook/WhatsApp/Messenger ভেতরের ওয়েবভিউ) থেকে খুললে
    // ইনস্টল বাটন বা "Home screen"-এ যোগ করার অপশন কোনোদিনই আসে না।
    // তাই সত্যিকারের ব্রাউজারে খোলার পরামর্শ দেখানো হবে।
    const insideAppBrowser =
      /fban|fbav|fb_iab|instagram|line\/|whatsapp|micromessenger|twitter|snapchat|wv\)/.test(
        window.navigator.userAgent.toLowerCase(),
      );
    if (insideAppBrowser && device.kind !== 'desktop') setInAppBrowser(true);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Android Chrome কিছু ক্ষেত্রে পেজটা আগে থেকেই খোলা থাকলেও পরে এই ইভেন্ট দেয়
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * ইনস্টল চাপলে:
   * 1. Chrome/Edge/Samsung-এ স্বাভাবিক ইনস্টল পপআপ খোলে।
   * 2. পপআপ না এলে (পুরোনো OPPO A5s, Firefox, in-app ব্রাউজার) —
   *    ওই ডিভাইসের জন্য ধাপে ধাপে লেখা গাইড খোলে, যাতে বাটন কখনো "কিছুই করে না" না হয়।
   */
  const installApp = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return true;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    setShowInstallGuide(true);
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    guideKind,
    inAppBrowser,
    showInstallGuide,
    setShowInstallGuide,
    installApp,
  };
}
