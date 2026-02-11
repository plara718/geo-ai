import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Play, ArrowLeft } from 'lucide-react';

// 仮のデータ（本来はDBから計算して渡すべきですが、まずはモックで動かします）
const MOCK_DATA = [
  { subject: 'アジア', A: 40, fullMark: 100 },
  { subject: '欧州', A: 80, fullMark: 100 },
  { subject: 'アフリカ', A: 30, fullMark: 100 },
  { subject: '北米', A: 90, fullMark: 100 },
  { subject: '南米', A: 60, fullMark: 100 },
  { subject: 'オセアニア', A: 70, fullMark: 100 },
];

export const ReviewScreen = ({ reviewStrategy, onStartReview, onBack }) => {
  if (!reviewStrategy) return null;

  return (
    <Container maxWidth="sm" className="animate-fade-in" sx={{ py: 4 }}>
      <Button startIcon={<ArrowLeft />} onClick={onBack} sx={{ mb: 2 }}>
        戻る
      </Button>

      <Typography variant="h5" fontWeight="900" gutterBottom>
        AI弱点分析レポート
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        直近の学習データに基づき、重点対策カリキュラムを生成しました。
      </Typography>

      {/* 分析チャートエリア */}
      <Paper
        sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8fafc', height: 300 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_DATA}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="My Score"
              dataKey="A"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Paper>

      {/* 提案カード */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: '2px solid #f43f5e',
          bgcolor: '#fff1f2',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bgcolor: '#f43f5e',
            color: 'white',
            px: 2,
            py: 0.5,
            borderBottomRightRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          WEAKNESS DETECTED
        </Box>

        <Box mt={3}>
          <Typography variant="h6" fontWeight="bold" color="#be123c">
            {reviewStrategy.target_region_label} ×{' '}
            {reviewStrategy.target_system_label}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2, color: '#9f1239' }}>
            {reviewStrategy.reason}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => onStartReview(reviewStrategy)}
            startIcon={<Play fill="currentColor" />}
            sx={{
              bgcolor: '#f43f5e',
              fontWeight: 'bold',
              borderRadius: 3,
              '&:hover': { bgcolor: '#e11d48' },
            }}
          >
            弱点克服レッスンを開始
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
