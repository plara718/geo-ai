import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ArrowLeft, Search, Book, Bookmark } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_ID } from '../lib/constants';

export const VocabularyLibrary = ({ userId, onBack }) => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTerms = async () => {
      if (!userId) return;
      try {
        const q = query(
          collection(db, 'artifacts', APP_ID, 'users', userId, 'vocabulary'),
          orderBy('lastSeenAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTerms(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, [userId]);

  // フィルタリング
  const filteredTerms = terms.filter(
    (t) => t.term.includes(searchTerm) || t.def.includes(searchTerm)
  );

  return (
    <Container maxWidth="md" className="animate-fade-in" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton
          onClick={onBack}
          sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight="900">
            地理用語集
          </Typography>
          <Typography variant="caption" color="text.secondary">
            AI授業で登場した重要語句のアーカイブ ({terms.length}語)
          </Typography>
        </Box>
      </Box>

      {/* 検索バー */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 4, borderRadius: 3, bgcolor: '#f1f5f9' }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="用語を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Search className="text-slate-400" size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* リスト表示 */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : filteredTerms.length === 0 ? (
        <Box textAlign="center" py={10} color="text.secondary">
          <Book size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <Typography>
            まだ用語が登録されていません。
            <br />
            学習を進めると自動で追加されます。
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredTerms.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: '0.2s',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={1}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {item.term}
                  </Typography>
                  <Chip
                    label={`x${item.encounterCount || 1}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  lineHeight={1.6}
                >
                  {item.def}
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{ fontSize: '0.65rem', bgcolor: '#f1f5f9' }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
