import { useCallback, useEffect, useRef, useState } from 'react';
import { readIdentity, STATS_KEY, type LocalStatsSnapshot } from '../utils/storage';
import { isRemoteAnalyticsEnabled, sendHeartbeat } from '../lib/analytics';

const HEARTBEAT_MS = 60_000;

export type LocalStats = LocalStatsSnapshot;

const EMPTY_STATS: LocalStats = {
  totalGenerations: 0,
  perTemplate: {},
  perDay: {},
  daysVisited: [],
  firstSeenAt: new Date().toISOString(),
};

/** Device-local calendar date, e.g. 2026-10-23. */
function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

function readStats(): LocalStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return EMPTY_STATS;
    return { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<LocalStats>) };
  } catch {
    return EMPTY_STATS;
  }
}

export function useAnonymousIdentity() {
  const [identityId, setIdentityId] = useState('');
  const [stats, setStats] = useState<LocalStats>(EMPTY_STATS);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<number | null>(null);
  const statsRef = useRef<LocalStats>(EMPTY_STATS);
  const identityRef = useRef('');
  const dirtyRef = useRef(false);
  const lastBeatTriggerRef = useRef(0);

  const persist = useCallback((next: LocalStats) => {
    statsRef.current = next;
    setStats(next);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Local usage counters could not be stored', e);
    }
  }, []);

  const beat = useCallback((options?: { force?: boolean; keepalive?: boolean }) => {
    const uid = identityRef.current;
    if (!uid || !isRemoteAnalyticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    const now = Date.now();
    if (!options?.force && !dirtyRef.current && now - lastBeatTriggerRef.current < 2000) {
      return;
    }
    lastBeatTriggerRef.current = now;

    const snapshot = statsRef.current;
    const top = Object.entries(snapshot.perTemplate).sort((a, b) => b[1].count - a[1].count)[0];
    const currentDay = today();
    void sendHeartbeat(
      {
        uid,
        day: currentDay,
        dayGenerations: snapshot.perDay[currentDay] || 0,
        templateId: top ? top[0] : '',
        templateTitle: top ? top[1].title : '',
        category: top ? top[1].category : 'employee',
        totalGenerations: snapshot.totalGenerations,
        perTemplate: Object.fromEntries(
          Object.entries(snapshot.perTemplate).map(([id, v]) => [id, v.count]),
        ),
      },
      { keepalive: options?.keepalive },
    ).then((ok) => {
      if (ok) {
        dirtyRef.current = false;
        setLastHeartbeatAt(Date.now());
      }
    });
  }, []);

  useEffect(() => {
    const identity = readIdentity();
    identityRef.current = identity.uid;
    setIdentityId(identity.uid);

    const initial = readStats();
    initial.firstSeenAt = initial.firstSeenAt || identity.firstSeenAt;
    const days = initial.daysVisited.includes(today())
      ? initial.daysVisited
      : [...initial.daysVisited, today()].slice(-400);
    persist({ ...initial, daysVisited: days });

    beat({ force: true });
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') beat();
    }, HEARTBEAT_MS);

    const onVisibleChange = () => {
      if (document.visibilityState === 'visible') {
        beat();
      } else if (dirtyRef.current) {
        beat({ force: true, keepalive: true });
      }
    };
    const onPageHide = () => {
      if (dirtyRef.current) beat({ force: true, keepalive: true });
    };
    const onOnline = () => {
      beat({ force: true });
    };

    document.addEventListener('visibilitychange', onVisibleChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibleChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('online', onOnline);
    };
  }, [beat, persist]);

  const trackApplicationGeneration = useCallback(
    (templateId: string, title: string, category: 'employee' | 'student' = 'employee') => {
      const prev = statsRef.current;
      const entry = prev.perTemplate[templateId] || { title, category, count: 0 };
      const day = today();
      const perDay = Object.fromEntries(
        Object.entries({ ...prev.perDay, [day]: (prev.perDay[day] || 0) + 1 }).slice(-400),
      );
      persist({
        ...prev,
        totalGenerations: prev.totalGenerations + 1,
        perDay,
        perTemplate: { ...prev.perTemplate, [templateId]: { ...entry, title, count: entry.count + 1 } },
      });
      dirtyRef.current = true;
      beat({ force: true, keepalive: true });
    },
    [beat, persist],
  );

  return {
    identityId,
    stats,
    isRemoteEnabled: isRemoteAnalyticsEnabled,
    lastHeartbeatAt,
    trackApplicationGeneration,
  };
}
