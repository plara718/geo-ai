import { useEffect, useRef } from 'react';

/**
 * 学習中の意図しない離脱を防ぐフック
 * ブラウザバックやリロードを検知して警告を出します
 */
export const useLessonGuard = (isActive, onAttemptBack) => {
  const backHandlerRef = useRef(onAttemptBack);

  useEffect(() => {
    backHandlerRef.current = onAttemptBack;
  }, [onAttemptBack]);

  // 1. ブラウザバック（Android戻る / iOSスワイプ）の検知
  useEffect(() => {
    if (!isActive) return;

    // 現在の履歴状態を「ガード用」として追加
    const pushGuard = () => {
      window.history.pushState({ guard: true }, '', window.location.href);
    };

    pushGuard();

    const handlePopState = (e) => {
      // 戻る操作が行われたらガードを再設定し、警告ダイアログを出す
      pushGuard();
      if (backHandlerRef.current) {
        backHandlerRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive]);

  // 2. リロード/タブ閉じの警告
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);
};
