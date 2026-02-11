import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_ID } from '../lib/constants';
import { getTodayString, scrollToTop } from '../lib/utils';
import { useLessonGenerator } from '../hooks/useLessonGenerator';
import { useLessonGuard } from '../hooks/useLessonGuard';

// コンポーネント
import ClimateChart from '../components/ClimateChart';
import PopulationPyramid from '../components/PopulationPyramid';
import BlindStatistics from '../components/BlindStatistics';
import TernaryPlot from '../components/TernaryPlot'; // 三角グラフ
import SmartLoader from '../components/SmartLoader';
import { SafeMarkdown } from '../components/SafeMarkdown';
import { SummaryScreen } from './SummaryScreen';

export const LessonScreen = ({
  apiKey,
  userId,
  learningMode,
  difficulty,
  selectedUnit,
  sessionNum,
  reviewContext,
  onExit,
}) => {
  const [step, setStep] = useState('loading');
  const [lessonData, setLessonData] = useState(null);

  const { generateDailyLesson, fetchTodayLesson, isProcessing, genError } =
    useLessonGenerator(apiKey, userId);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState([]);

  // 解説表示モード管理
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);

  // 離脱確認ダイアログ
  const [showExitDialog, setShowExitDialog] = useState(false);

  // ガード機能の有効化（学習中のみ）
  const isLessonActive = step === 'lecture' || step === 'quiz';
  useLessonGuard(isLessonActive, () => setShowExitDialog(true));

  useEffect(() => {
    const initLesson = async () => {
      if (!userId || !sessionNum) return;
      setStep('loading');

      // 既存データ確認
      let data = await fetchTodayLesson(sessionNum);

      // なければ新規生成
      if (!data) {
        if (!apiKey) {
          alert('APIキー未設定');
          onExit();
          return;
        }
        data = await generateDailyLesson(
          learningMode,
          difficulty,
          selectedUnit,
          sessionNum,
          reviewContext
        );
      }

      if (data) {
        setLessonData(data);
        if (data.completed) {
          setQuizResults(data.quizResults || []);
          setStep('summary');
        } else {
          setStep('lecture');
        }
      } else {
        setStep('error');
      }
    };
    initLesson();
  }, [sessionNum]);

  // クイズ回答処理
  const handleAnswer = (selectedIndex) => {
    const q = lessonData.content.questions[quizIndex];
    const isCorrect = selectedIndex === q.correct;

    const result = {
      q: q.q,
      is_correct: isCorrect,
      userSelection: selectedIndex,
      correctSelection: q.correct,
      exp: q.exp,
      thinking_process: q.thinking_process,
      tags: lessonData.content.essential_terms ? [] : [],
    };

    setQuizResults((prev) => [...prev, result]);
    setCurrentFeedbackData(result);
    setShowFeedback(true);
    scrollToTop();
  };

  // 次の問題へ or 終了
  const handleNext = async () => {
    setShowFeedback(false);
    setCurrentFeedbackData(null);

    const questions = lessonData.content.questions || [];
    if (quizIndex < questions.length - 1) {
      setQuizIndex(quizIndex + 1);
      scrollToTop();
    } else {
      await finishLesson();
    }
  };

  const finishLesson = async () => {
    const today = getTodayString();
    const quizCorrect =
      quizResults.filter((q) => q.is_correct).length +
      (currentFeedbackData?.is_correct ? 1 : 0);
    const total = (lessonData.content.questions || []).length;

    // 最新の結果を含める
    const finalResults = [...quizResults];
    if (currentFeedbackData && !quizResults.includes(currentFeedbackData)) {
      finalResults.push(currentFeedbackData);
    }

    const completedData = {
      quizResults: finalResults,
      scores: {
        quizCorrect,
        quizTotal: total,
        comment: '共通テスト演習完了',
      },
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // DB保存
    await setDoc(
      doc(
        db,
        'artifacts',
        APP_ID,
        'users',
        userId,
        'daily_progress',
        `${today}_${sessionNum}`
      ),
      completedData,
      { merge: true }
    );

    // state更新して結果画面へ
    setQuizResults(finalResults);
    setStep('summary');
  };

  // 図版レンダリング関数
  const renderVisualAid = (visualAid) => {
    if (!visualAid) return null;

    // 雨温図
    if (visualAid.type === 'climate_chart') {
      return (
        <Box mt={4} mb={2}>
          <ClimateChart data={visualAid.data} title={visualAid.title} />
        </Box>
      );
    }

    // 人口ピラミッド
    if (visualAid.type === 'population_pyramid') {
      return (
        <Box mt={4} mb={2}>
          <PopulationPyramid data={visualAid.data} title={visualAid.title} />
        </Box>
      );
    }

    // ブラインド統計表
    if (visualAid.type === 'statistics_table') {
      return (
        <Box mt={4} mb={2}>
          <BlindStatistics data={visualAid.data} title={visualAid.title} />
        </Box>
      );
    }

    // 三角グラフ
    if (visualAid.type === 'ternary_plot') {
      return (
        <Box mt={4} mb={2}>
          <TernaryPlot
            data={visualAid.data}
            title={visualAid.title}
            labels={visualAid.labels || ['A', 'B', 'C']}
          />
        </Box>
      );
    }

    return null;
  };

  // レンダリング -------------------------------------------

  if (isProcessing || step === 'loading')
    return <SmartLoader message="AIが共通テスト地理の問題を作成中..." />;
  if (step === 'error')
    return <Alert severity="error">{genError || '読み込み失敗'}</Alert>;
  if (step === 'summary')
    return (
      <SummaryScreen
        lessonData={lessonData}
        quizResults={quizResults}
        onFinish={onExit}
      />
    );

  const content = lessonData.content;
  const q = content.questions ? content.questions[quizIndex] : null;

  return (
    <Container maxWidth="md" className="animate-fade-in" sx={{ pb: 8 }}>
      {/* 講義パート */}
      {step === 'lecture' && (
        <>
          <Box mb={4}>
            <Typography variant="overline" color="primary" fontWeight="bold">
              SESSION {sessionNum}
            </Typography>
            <Typography variant="h5" fontWeight="900" mt={1}>
              {content.theme}
            </Typography>
          </Box>

          <Paper sx={{ p: 4, mb: 4, borderRadius: 4, lineHeight: 1.8 }}>
            <SafeMarkdown content={content.lecture} />

            {/* 図版表示 */}
            {renderVisualAid(content.visual_aid)}
          </Paper>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              setStep('quiz');
              scrollToTop();
            }}
            endIcon={<ChevronRight />}
            sx={{ py: 2, fontWeight: 'bold' }}
          >
            実戦問題へ (全{content.questions?.length || 0}問)
          </Button>
        </>
      )}

      {/* 問題パート */}
      {step === 'quiz' && q && (
        <>
          <LinearProgress
            variant="determinate"
            value={(quizIndex / content.questions.length) * 100}
            sx={{ mb: 2, borderRadius: 2 }}
          />

          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            Q{quizIndex + 1}. 共通テスト形式
          </Typography>

          {/* 図版表示 (問題参考用) */}
          {content.visual_aid && (
            <>
              <Typography
                variant="subtitle2"
                sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
              >
                【参考資料】
              </Typography>
              {renderVisualAid(content.visual_aid)}
            </>
          )}

          <Paper
            sx={{
              p: 3,
              my: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {q.q}
            </Typography>

            {showFeedback ? (
              <Box className="animate-fade-in">
                <Alert
                  severity={
                    currentFeedbackData.is_correct ? 'success' : 'error'
                  }
                  sx={{ mb: 2, fontWeight: 'bold' }}
                >
                  {currentFeedbackData.is_correct ? '正解！' : '不正解...'}
                </Alert>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 2, bgcolor: '#f1f5f9' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    思考のプロセス（着眼点）
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {currentFeedbackData.thinking_process ||
                      '解説を参照してください'}
                  </Typography>
                </Paper>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    解説
                  </Typography>
                  <SafeMarkdown content={q.exp} />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleNext}
                >
                  {quizIndex < content.questions.length - 1
                    ? '次の問題へ'
                    : '結果を見る'}
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.5} mt={3}>
                {q.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    fullWidth
                    onClick={() => handleAnswer(idx)}
                    sx={{
                      py: 2,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 2,
                      fontSize: '0.95rem',
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {opt}
                  </Button>
                ))}
              </Stack>
            )}
          </Paper>
        </>
      )}

      {/* 離脱確認ダイアログ */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle className="text-amber-500" size={24} />
          学習を中断しますか？
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            このページを離れると、現在の学習内容は保存されません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitDialog(false)}>続ける</Button>
          <Button onClick={onExit} color="error" variant="contained">
            中断する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
