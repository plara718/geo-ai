import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { TrendingUp, Award, Calendar, Activity } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      bgcolor: 'white',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
    }}
  >
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>
      <Icon size={24} />
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight="bold">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="900" lineHeight={1}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const StatsOverview = ({ history }) => {
  if (!history || history.length === 0) return null;

  // 集計ロジック
  const totalSessions = history.length;
  const totalQuizzes = history.reduce(
    (acc, sess) => acc + (sess.scores?.quizTotal || 0),
    0
  );
  const totalCorrect = history.reduce(
    (acc, sess) => acc + (sess.scores?.quizCorrect || 0),
    0
  );

  // 平均正答率
  const avgRate =
    totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0;

  // 直近の傾向（ラスト3回の平均）
  const recentSessions = history.slice(0, 3);
  const recentRate =
    recentSessions.length > 0
      ? Math.round(
          (recentSessions.reduce(
            (a, s) => a + (s.scores?.quizCorrect || 0),
            0
          ) /
            recentSessions.reduce(
              (a, s) => a + (s.scores?.quizTotal || 0),
              0
            )) *
            100
        )
      : 0;

  return (
    <Box mb={4} className="animate-fade-in">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StatCard
            icon={Award}
            label="平均正答率"
            value={`${avgRate}%`}
            color={avgRate >= 80 ? '#10b981' : '#3b82f6'}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            icon={TrendingUp}
            label="直近3回の精度"
            value={`${recentRate}%`}
            color={recentRate >= avgRate ? '#f59e0b' : '#64748b'}
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            icon={Calendar}
            label="学習回数"
            value={`${totalSessions}回`}
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            icon={Activity}
            label="総解答数"
            value={`${totalQuizzes}問`}
            color="#ec4899"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsOverview;
