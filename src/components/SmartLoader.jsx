import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';
import { LOADING_TRIVIA } from '../lib/constants';

const SmartLoader = ({ message = '読み込み中...' }) => {
  const [trivia, setTrivia] = useState('');

  useEffect(() => {
    // ランダムに雑学を選んで表示
    const randomTrivia =
      LOADING_TRIVIA[Math.floor(Math.random() * LOADING_TRIVIA.length)];
    setTrivia(randomTrivia);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      className="animate-fade-in"
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{ color: '#3b82f6', mb: 4 }}
      />

      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="text.primary"
      >
        {message}
      </Typography>

      <Fade in={true} timeout={1000}>
        <Box
          sx={{
            mt: 3,
            p: 3,
            maxWidth: 400,
            bgcolor: '#f1f5f9',
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            fontWeight="bold"
            mb={1}
          >
            Did you know?
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ fontStyle: 'italic' }}
          >
            {trivia}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default SmartLoader;
