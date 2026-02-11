import React from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { Rocket } from 'lucide-react';

export const LoginScreen = ({ onLogin, isLoggingIn }) => {
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={10}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box display="flex" justifyContent="center" mb={3}>
            <Box p={2} borderRadius="50%" bgcolor="rgba(59, 130, 246, 0.2)">
              <Rocket size={40} className="text-blue-400" />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight="900" gutterBottom>
            Geo Master
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}
          >
            共通テスト地理B・地理総合
            <br />
            特化型AI演習アプリ
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onLogin}
            disabled={isLoggingIn}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {isLoggingIn ? 'Loading...' : '学習をはじめる'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
