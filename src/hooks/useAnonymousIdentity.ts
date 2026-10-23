import { useState, useEffect } from 'react';

export interface GenerationRecord {
  templateId: string;
  title: string;
  category: 'employee' | 'student';
  timestamp: string;
  userId: string;
}

export function useAnonymousIdentity() {
  const [identityId, setIdentityId] = useState<string>('');

  useEffect(() => {
    let stored = localStorage.getItem('anon_user_uid');
    if (!stored) {
      stored = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
      localStorage.setItem('anon_user_uid', stored);
    }
    setIdentityId(stored);

    // Track daily visitor
    const today = new Date().toISOString().split('T')[0];
    const visitorKey = `visitor_day_${today}`;
    if (!localStorage.getItem(visitorKey)) {
      localStorage.setItem(visitorKey, '1');
      const allVisitorsKey = 'total_unique_visitors';
      const count = parseInt(localStorage.getItem(allVisitorsKey) || '0', 10);
      localStorage.setItem(allVisitorsKey, (count + 1).toString());
    }

    // Heartbeat for live user tracking
    const heartbeatKey = `live_user_${stored}`;
    sessionStorage.setItem('session_active', '1');
    localStorage.setItem(heartbeatKey, Date.now().toString());

    const interval = setInterval(() => {
      localStorage.setItem(heartbeatKey, Date.now().toString());
    }, 15000);

    return () => {
      clearInterval(interval);
      localStorage.removeItem(heartbeatKey);
    };
  }, []);

  const trackApplicationGeneration = (templateId: string, title: string, category: 'employee' | 'student' = 'employee') => {
    try {
      const historyKey = 'app_generation_stats';
      const history: GenerationRecord[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const newRecord: GenerationRecord = {
        templateId,
        title,
        category,
        timestamp: new Date().toISOString(),
        userId: identityId || 'anon',
      };
      
      history.push(newRecord);
      // Keep last 300 records
      localStorage.setItem(historyKey, JSON.stringify(history.slice(-300)));

      // Update aggregate count
      const countKey = `template_count_${templateId}`;
      const prevCount = parseInt(localStorage.getItem(countKey) || '0', 10);
      localStorage.setItem(countKey, (prevCount + 1).toString());

      // Update total generated
      const totalGenKey = 'total_generated_count';
      const prevTotal = parseInt(localStorage.getItem(totalGenKey) || '0', 10);
      localStorage.setItem(totalGenKey, (prevTotal + 1).toString());
    } catch {
      // ignore storage quota issues
    }
  };

  return {
    identityId,
    trackApplicationGeneration,
  };
}
