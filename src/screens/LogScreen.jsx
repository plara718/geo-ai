import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  Chip,
  IconButton,
  Collapse,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Cancel,
  Map,
  BarChart2,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_ID } from '../lib/constants';
import StatsOverview from '../components/StatsOverview';
import ClimateChart from '../components/ClimateChart';
import { SafeMarkdown } from '../components/SafeMarkdown';

export const LogScreen = ({ userId, onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null); // 詳細モーダル用

  // 履歴データ取得
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      try {
        const q = query(
          collection(
            db,
            'artifacts',
            APP_ID,
            'users',
            userId,
            'daily_progress'
          ),
          orderBy('completedAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(logs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <Box
        height="50vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" className="animate-fade-in" sx={{ py: 4, pb: 10 }}>
      {/* ヘッダー */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          onClick={onBack}
          sx={{ mr: 1, bgcolor: 'white', boxShadow: 1 }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Typography variant="h5" fontWeight="900">
          学習履歴
        </Typography>
      </Box>

      {/* 統計サマリー */}
      <StatsOverview history={history} />

      {/* 履歴リスト */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight="bold"
        mb={2}
      >
        最近の学習ログ ({history.length}件)
      </Typography>

      {history.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: '#f8fafc',
          }}
        >
          <Typography color="text.secondary">
            まだ学習データがありません。
          </Typography>
        </Paper>
      ) : (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {history.map((log) => {
            const date = new Date(log.completedAt).toLocaleDateString();
            const score = log.scores?.quizCorrect || 0;
            const total = log.scores?.quizTotal || 1;
            const percent = Math.round((score / total) * 100);

            return (
              <Paper
                key={log.id}
                elevation={0}
                onClick={() => setSelectedLog(log)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: '#3b82f6',
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={1}
                >
                  <Chip
                    label={log.content?.theme || '地理演習'}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="flex"
                    alignItems="center"
                  >
                    <Calendar size={12} style={{ marginRight: 4 }} /> {date}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="end"
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      スコア
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      color={percent >= 80 ? 'success.main' : 'text.primary'}
                    >
                      {percent}
                      <span style={{ fontSize: '1rem' }}>%</span>
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      log.learningMode === 'review' ? '弱点克服' : '通常学習'
                    }
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                </Box>
              </Paper>
            );
          })}
        </List>
      )}

      {/* 詳細ダイアログ */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
      >
        {selectedLog && (
          <>
            <DialogTitle
              fontWeight="bold"
              sx={{ borderBottom: '1px solid #f1f5f9' }}
            >
              学習詳細レポート
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {/* テーマ情報 */}
              <Box mb={3}>
                <Typography variant="caption" color="text.secondary">
                  テーマ
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {selectedLog.content?.theme}
                </Typography>
              </Box>

              {/* ★地理特化: 雨温図データの再表示 */}
              {selectedLog.content?.visual_aid?.type === 'climate_chart' && (
                <Box mb={4}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BarChart2 size={18} className="text-blue-500" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      出題された図版
                    </Typography>
                  </Box>
                  <ClimateChart
                    data={selectedLog.content.visual_aid.data}
                    title={selectedLog.content.visual_aid.title}
                  />
                </Box>
              )}

              {/* クイズ結果 */}
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                gutterBottom
                sx={{ mt: 2 }}
              >
                回答結果一覧
              </Typography>
              <List disablePadding>
                {(selectedLog.quizResults || []).map((q, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: q.is_correct ? '#f0fdf4' : '#fef2f2',
                    }}
                  >
                    <Box display="flex" gap={1.5}>
                      <Box mt={0.5}>
                        {q.is_correct ? (
                          <CheckCircle size={20} className="text-emerald-500" />
                        ) : (
                          <Cancel size={20} className="text-red-500" />
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {q.q}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem' }}
                        >
                          解説: {q.exp}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
              <Button
                onClick={() => setSelectedLog(null)}
                fullWidth
                variant="contained"
                size="large"
                sx={{ borderRadius: 2 }}
              >
                閉じる
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};
