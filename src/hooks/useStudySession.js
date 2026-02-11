import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_ID, MAX_DAILY_SESSIONS } from '../lib/constants';
import { getTodayString } from '../lib/utils';

export const useStudySession = (userId) => {
  const [historyMeta, setHistoryMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const today = getTodayString();
    const q = query(
      collection(db, 'artifacts', APP_ID, 'users', userId, 'daily_progress'),
      where('completedAt', '>=', `${today}T00:00:00`),
      where('completedAt', '<=', `${today}T23:59:59`)
    );

    // リアルタイムリスナー
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const meta = {};
        snapshot.docs.forEach((doc) => {
          const id = doc.id; // "YYYY-MM-DD_1"
          const sessionNum = parseInt(id.split('_')[1]);
          meta[sessionNum] = { exists: true, completed: doc.data().completed };
        });
        setHistoryMeta(meta);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // 次にやるべきセッション番号を特定
  let activeSession = 1;
  for (let i = 1; i <= MAX_DAILY_SESSIONS; i++) {
    if (historyMeta[i]?.completed) {
      activeSession = i + 1;
    } else {
      activeSession = i;
      break;
    }
  }

  // 上限到達判定
  const isDailyLimitReached = activeSession > MAX_DAILY_SESSIONS;
  if (isDailyLimitReached) activeSession = MAX_DAILY_SESSIONS;

  return { activeSession, historyMeta, isDailyLimitReached, loading };
};
