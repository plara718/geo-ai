import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Link,
  Box,
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_ID } from '../lib/constants';

const SettingsModal = ({ open, onClose, userId, currentApiKey, onSave }) => {
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    if (currentApiKey) setKeyInput(currentApiKey);
  }, [currentApiKey]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      // Firestoreに保存
      await setDoc(
        doc(db, 'artifacts', APP_ID, 'users', userId, 'settings', 'config'),
        {
          apiKey: keyInput,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // State更新
      onSave(keyInput);
      onClose();
    } catch (e) {
      alert('保存に失敗しました');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight="bold">設定</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Google Gemini APIキーを設定してください。
        </Typography>
        <Box my={2}>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Gemini API Key"
            variant="outlined"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            helperText={
              <Link
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener"
              >
                APIキーをここで取得
              </Link>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" disabled={!keyInput}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
