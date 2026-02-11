import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Toast = ({ message, onClose }) => {
  return (
    <Snackbar
      open={!!message}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity="info"
        sx={{ width: '100%' }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
