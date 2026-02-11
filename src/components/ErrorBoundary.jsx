import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { AlertTriangle, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; // 強制的にリロードしてトップへ
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          height="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="#f8fafc"
          p={2}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, textAlign: 'center', borderRadius: 4, maxWidth: 400 }}
          >
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              予期せぬエラーが発生しました
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              申し訳ありません。アプリの処理中に問題が発生しました。
            </Typography>
            <Button
              variant="contained"
              onClick={this.handleReset}
              startIcon={<Home size={18} />}
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              ホームに戻る
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
