import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { APP_ID, TEXTBOOK_UNITS } from './lib/constants';
import theme from './theme';

// Hooks
import { useAuthUser } from './hooks/useAuthUser';
import { useStudySession } from './hooks/useStudySession';

// Screens & Components
import { LoginScreen } from './screens/LoginScreen';
import StartScreen from './screens/StartScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { LogScreen } from './screens/LogScreen';
import { VocabularyLibrary } from './screens/VocabularyLibrary'; // 用語集
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

function App() {
  const { user, loading: authLoading, loginAsGuest, logout } = useAuthUser();
  const {
    activeSession,
    historyMeta,
    isDailyLimitReached,
    loading: sessionLoading,
  } = useStudySession(user?.uid);

  // App State
  // currentScreen: 'start' | 'lesson' | 'review' | 'log' | 'vocab'
  const [currentScreen, setCurrentScreen] = useState('start');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Lesson Settings
  const [learningMode, setLearningMode] = useState('general');
  const [selectedUnit, setSelectedUnit] = useState(TEXTBOOK_UNITS[0]);
  const [difficulty, setDifficulty] = useState('standard');
  const [viewingSession, setViewingSession] = useState(1);

  // 復習モード用データ
  const [reviewContext, setReviewContext] = useState(null);

  // APIキー読み込み
  useEffect(() => {
    if (user) {
      getDoc(
        doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'config')
      ).then((snap) => {
        if (snap.exists() && snap.data().apiKey) setApiKey(snap.data().apiKey);
      });
    }
  }, [user]);

  // セッション情報の同期
  useEffect(() => {
    if (!sessionLoading) setViewingSession(activeSession);
  }, [activeSession, sessionLoading]);

  // ローディング表示
  if (authLoading || (user && sessionLoading)) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未ログイン時
  if (!user) return <LoginScreen onLogin={loginAsGuest} isLoggingIn={false} />;

  // 画面ルーティング
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* スタート画面 */}
        {currentScreen === 'start' && (
          <StartScreen
            userId={user.uid}
            activeSession={activeSession}
            viewingSession={viewingSession}
            isDailyLimitReached={isDailyLimitReached}
            learningMode={learningMode}
            setLearningMode={setLearningMode}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onSwitchSession={setViewingSession}
            // レッスン開始
            onStartLesson={() => {
              if (!apiKey) {
                setToastMsg('APIキーを設定してください');
                setIsSettingsOpen(true);
                return;
              }
              setReviewContext(null); // 通常モード
              setCurrentScreen('lesson');
            }}
            onResumeLesson={() => setCurrentScreen('lesson')}
            // 復習モード開始
            onStartReview={(strategy) => {
              if (!apiKey) {
                setToastMsg('APIキーを設定してください');
                setIsSettingsOpen(true);
                return;
              }
              setReviewContext(strategy); // 弱点データをセット
              setCurrentScreen('review'); // まず分析画面へ
            }}
            // 履歴画面へ
            onShowLog={() => setCurrentScreen('log')}
            // 用語集画面へ
            onShowVocab={() => setCurrentScreen('vocab')}
            onLogout={logout}
            openSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* 復習分析画面 */}
        {currentScreen === 'review' && reviewContext && (
          <ReviewScreen
            reviewStrategy={reviewContext}
            onBack={() => setCurrentScreen('start')}
            onStartReview={() => {
              setLearningMode('review'); // モードを復習に
              setCurrentScreen('lesson'); // レッスン開始
            }}
          />
        )}

        {/* 履歴画面 */}
        {currentScreen === 'log' && (
          <LogScreen
            userId={user.uid}
            onBack={() => setCurrentScreen('start')}
          />
        )}

        {/* 用語集画面 */}
        {currentScreen === 'vocab' && (
          <VocabularyLibrary
            userId={user.uid}
            onBack={() => setCurrentScreen('start')}
          />
        )}

        {/* レッスン画面 */}
        {currentScreen === 'lesson' && (
          <LessonScreen
            apiKey={apiKey}
            userId={user.uid}
            sessionNum={viewingSession}
            learningMode={learningMode}
            difficulty={difficulty}
            selectedUnit={selectedUnit}
            reviewContext={reviewContext} // 弱点データを渡す
            onExit={() => {
              setLearningMode('general'); // モードリセット
              setReviewContext(null);
              setCurrentScreen('start');
            }}
          />
        )}

        <SettingsModal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userId={user.uid}
          currentApiKey={apiKey}
          onSave={setApiKey}
        />

        <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
