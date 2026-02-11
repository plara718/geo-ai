import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Stack,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  Play,
  BookOpen,
  Settings,
  LogOut,
  Activity,
  History,
  Book,
} from 'lucide-react';
import { TEXTBOOK_UNITS, DIFFICULTY_DESCRIPTIONS } from '../lib/constants';
import { getReviewStrategy } from '../lib/reviewStrategy';

const StartScreen = ({
  activeSession,
  viewingSession,
  isDailyLimitReached,
  learningMode,
  setLearningMode,
  selectedUnit,
  setSelectedUnit,
  difficulty,
  setDifficulty,

  onStartLesson,
  onSwitchSession,
  onStartReview, // 復習モード開始用
  onShowLog, // 履歴画面表示用
  onShowVocab, // 用語集画面表示用
  onLogout,
  userId,
  openSettings,
}) => {
  const themeColor = 'primary';
  const currentDifficultyDesc =
    DIFFICULTY_DESCRIPTIONS.general?.[difficulty]?.desc || '';

  // 弱点分析データの取得ロジック
  const [reviewStrategy, setReviewStrategy] = useState(null);
  const [loadingStrategy, setLoadingStrategy] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!userId) return;
      setLoadingStrategy(true);
      try {
        const strategy = await getReviewStrategy(userId);
        setReviewStrategy(strategy);
      } catch (e) {
        console.error('Strategy fetch failed', e);
      } finally {
        setLoadingStrategy(false);
      }
    };
    fetchStrategy();
  }, [userId]);

  // 復習ボタンクリック時
  const handleReviewStart = () => {
    if (reviewStrategy && onStartReview) {
      onStartReview(reviewStrategy);
    }
  };

  return (
    <Container maxWidth="sm" className="animate-fade-in" sx={{ pb: 8, pt: 2 }}>
      {/* ヘッダー */}
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            ID: {userId?.slice(0, 6)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {/* 履歴ボタン */}
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onShowLog}
            startIcon={<History size={14} />}
          >
            履歴
          </Button>
          {/* 用語集ボタン */}
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onShowVocab}
            startIcon={<Book size={14} />}
          >
            用語
          </Button>
          {/* 設定ボタン */}
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={openSettings}
            startIcon={<Settings size={14} />}
          >
            設定
          </Button>
          {/* ログアウトボタン */}
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={onLogout}
            startIcon={<LogOut size={14} />}
          >
            ログアウト
          </Button>
        </Stack>
      </Box>

      {/* 弱点克服レコメンドカード (データがある場合のみ表示) */}
      {!isDailyLimitReached && (
        <Box sx={{ mb: 4 }}>
          {loadingStrategy ? (
            <Skeleton
              variant="rectangular"
              height={140}
              sx={{ borderRadius: 4 }}
            />
          ) : (
            reviewStrategy && (
              <Fade in={true}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    background:
                      'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
                    border: '1px solid #FECDD3',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {/* Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: 16,
                      bgcolor: '#E11D48',
                      color: 'white',
                      px: 1.5,
                      py: 0.25,
                      borderRadius: 20,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)',
                    }}
                  >
                    <Activity size={14} /> WEAKNESS DETECTED
                  </Box>

                  <CardContent
                    sx={{ pt: 2.5, pb: 2, '&:last-child': { pb: 2 } }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#881337',
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      弱点克服トレーニング
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        color: '#9F1239',
                        mb: 1.5,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {reviewStrategy.reason}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={reviewStrategy.target_region_label}
                        size="small"
                        sx={{
                          bgcolor: 'white',
                          color: '#E11D48',
                          fontWeight: 'bold',
                          height: 24,
                          border: '1px solid #FDA4AF',
                        }}
                      />
                      <Chip
                        label={reviewStrategy.target_system_label}
                        size="small"
                        sx={{
                          bgcolor: 'white',
                          color: '#E11D48',
                          fontWeight: 'bold',
                          height: 24,
                          border: '1px solid #FDA4AF',
                        }}
                      />

                      <Box flexGrow={1} />

                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleReviewStart}
                        sx={{
                          bgcolor: '#E11D48',
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                          '&:hover': { bgcolor: '#BE123C' },
                        }}
                      >
                        今すぐ治療する
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            )
          )}
        </Box>
      )}

      {/* セッション選択タブ */}
      <Stack direction="row" spacing={1} mb={4} justifyContent="center">
        {[1, 2, 3].map((num) => {
          const isActive = num === viewingSession;
          const isLocked = num > activeSession;

          let bgClass = isActive
            ? 'bg-sky-600 text-white shadow-lg scale-105'
            : 'bg-white text-slate-400';
          if (isLocked) bgClass = 'bg-slate-100 text-slate-300 opacity-50';

          return (
            <button
              key={num}
              disabled={isLocked}
              onClick={() => onSwitchSession(num)}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${bgClass} border border-slate-200`}
            >
              <span className="text-[10px] font-bold">SESSION</span>
              <span className="text-2xl font-black">{num}</span>
            </button>
          );
        })}
      </Stack>

      {/* 設定・開始パネル */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={3} mb={4}>
          <FormControl fullWidth size="small">
            <InputLabel>学習テーマ（単元）</InputLabel>
            <Select
              value={selectedUnit}
              label="学習テーマ（単元）"
              onChange={(e) => setSelectedUnit(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {TEXTBOOK_UNITS.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={1}
              textAlign="center"
            >
              DIFFICULTY
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              {['standard', 'hard'].map((d) => (
                <Chip
                  key={d}
                  label={d === 'standard' ? '共通テスト' : '難関大'}
                  onClick={() => setDifficulty(d)}
                  color={difficulty === d ? themeColor : 'default'}
                  variant={difficulty === d ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              color="text.secondary"
              mt={1}
            >
              {currentDifficultyDesc}
            </Typography>
          </Box>
        </Stack>

        {/* スタートボタン */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onStartLesson}
          disabled={isDailyLimitReached}
          startIcon={<BookOpen />}
          sx={{
            borderRadius: 3,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 4,
            background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
          }}
        >
          学習をはじめる
        </Button>
      </Paper>
    </Container>
  );
};

export default StartScreen;
