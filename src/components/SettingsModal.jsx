import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Divider
} from '@mui/material';
import { Settings, AdminPanelSettings } from '@mui/icons-material';

const SettingsModal = ({ open, onClose, currentApiKey, onSave, onEnterAdmin }) => {
  const [key, setKey] = useState(currentApiKey || '');
  const [error, setError] = useState('');

  // 保存処理
  const handleSave = () => {
    if (!key.trim()) {
      setError('APIキーを入力してください');
      return;
    }
    // Gemini APIキーの簡易フォーマットチェック (AIza...で始まる)
    if (!key.startsWith('AIza')) {
      setError('有効なGoogle APIキーを入力してください');
      return;
    }
    onSave(key);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <Settings /> アプリ設定
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Gemini APIキー設定
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            AIによる問題生成を行うために、Google GeminiのAPIキーが必要です。
            キーはブラウザ内にのみ保存されます。
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="API Key (AIza...)"
            type="password"
            fullWidth
            variant="outlined"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
          />
          
          <Box mt={4}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <AdminPanelSettings fontSize="small" color="action" /> 管理者メニュー
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small"
              fullWidth
              onClick={() => {
                // 親コンポーネントの管理者モード切り替え関数を実行
                if (onEnterAdmin) {
                  onEnterAdmin();
                  onClose();
                }
              }}
            >
              管理者ダッシュボードを開く
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              ※保護者・指導者用の分析画面へ移動します
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;