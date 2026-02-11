import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { Home, CheckCircle, Cancel, EmojiEvents } from '@mui/icons-material';

export const SummaryScreen = ({ lessonData, quizResults, onFinish }) => {
  // スコア計算
  const correctCount = quizResults.filter((r) => r.is_correct).length;
  const totalCount = quizResults.length;
  const scorePercent =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 評価コメント
  let comment = 'もう一歩！';
  let color = 'error';
  if (scorePercent >= 80) {
    comment = '素晴らしい！';
    color = 'success';
  } else if (scorePercent >= 60) {
    comment = '合格圏内です';
    color = 'primary';
  }

  return (
    <Container maxWidth="sm" className="animate-fade-in" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <EmojiEvents sx={{ fontSize: 60, color: '#fbbf24', mb: 1 }} />
        <Typography variant="h5" fontWeight="900" gutterBottom>
          SESSION COMPLETE
        </Typography>
        <Typography variant="body1" color="text.secondary">
          お疲れ様でした。今回の学習成果です。
        </Typography>
      </Box>

      {/* スコアカード */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
        }}
      >
        <Typography variant="overline" fontWeight="bold" color="primary.main">
          TOTAL SCORE
        </Typography>
        <Typography
          variant="h2"
          fontWeight="900"
          color="primary.main"
          sx={{ my: 1 }}
        >
          {scorePercent}
          <span style={{ fontSize: '1.5rem' }}>%</span>
        </Typography>
        <Chip
          label={`${correctCount} / ${totalCount} 問正解 - ${comment}`}
          color={color}
          sx={{ fontWeight: 'bold' }}
        />
      </Paper>

      {/* 詳細リスト */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        振り返り
      </Typography>
      <Stack spacing={2} mb={4}>
        {quizResults.map((result, i) => (
          <Paper
            key={i}
            sx={{
              p: 2,
              borderRadius: 3,
              borderLeft: '6px solid',
              borderColor: result.is_correct ? 'success.main' : 'error.main',
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
              >
                Q{i + 1}
              </Typography>
              {result.is_correct ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <Cancel color="error" fontSize="small" />
              )}
            </Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {result.q}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {result.is_correct ? '正解しました' : '見直しが必要です'}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onFinish}
        startIcon={<Home />}
        sx={{ py: 2, borderRadius: 3, fontWeight: 'bold', boxShadow: 3 }}
      >
        ホームに戻る
      </Button>
    </Container>
  );
};
