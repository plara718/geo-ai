import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Container, Paper, Stack, 
  CircularProgress, Accordion, AccordionSummary, AccordionDetails, 
  Alert, ToggleButton, ToggleButtonGroup, Divider, Grid 
} from '@mui/material';
import { 
  BarChart as ChartIcon, 
  Search as SearchIcon, 
  ExpandMore as ChevronDown, 
  Warning as AlertIcon, 
  ArrowBack as ArrowLeft, 
  Settings as SettingsIcon, 
  Bolt as ProductionIcon, 
  Science as TestIcon,
  FamilyRestroom as FamilyIcon,
  AutoStories as ColumnIcon,
  Analytics as AnalyticsIcon,
  Public as GeoIcon
} from '@mui/icons-material';
import { collection, query, getDocs, orderBy, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { callAI } from '../lib/api'; 
import { APP_ID } from '../lib/constants';
import { SafeMarkdown } from '../components/SafeMarkdown';

const AdminDashboard = ({ onBack }) => {
  // 管理者用APIキーの取得（保存場所は任意、ここでは簡易的に共通キーまたはlocalStorageを使用）
  const apiKey = localStorage.getItem('gemini_api_key_admin') || import.meta.env.VITE_GEMINI_API_KEY;

  const [targetUid, setTargetUid] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 処理中ステート
  const [analyzingPerf, setAnalyzingPerf] = useState(false);
  const [generatingCol, setGeneratingCol] = useState(false);
  
  const [appMode, setAppMode] = useState("production");
  const [globalLoading, setGlobalLoading] = useState(false);

  const [analysisReport, setAnalysisReport] = useState(null); // 成績レポート
  const [interventionFocus, setInterventionFocus] = useState("");
  const [interventionInterest, setInterventionInterest] = useState("");
  const [parentAdvice, setParentAdvice] = useState(null); // 保護者向けコラム
  
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', APP_ID, 'settings', 'global'));
        if (snap.exists()) {
          setAppMode(snap.data().appMode || "production");
        }
      } catch (e) { console.error("設定取得失敗", e); }
    };
    fetchGlobalSettings();
  }, []);

  const handleSaveGlobalSettings = async (event, newMode) => {
    if (!newMode || newMode === appMode) return;
    setGlobalLoading(true);
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'settings', 'global'), {
        appMode: newMode,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setAppMode(newMode);
      setSuccessMsg(`システムモードを ${newMode === 'production' ? '本番 (安定版)' : 'テスト (実験版)'} に切り替えました。`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setErrorMsg("設定の更新に失敗しました。");
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!targetUid) return;
    setLoading(true);
    setErrorMsg(null);
    setLogs([]);
    setAnalysisReport(null);
    setParentAdvice(null);
    setInterventionFocus("");
    setInterventionInterest("");

    try {
      // 1. 学習ログ取得
      const q = query(
        collection(db, 'artifacts', APP_ID, 'users', targetUid, 'daily_progress'),
        orderBy('timestamp', 'desc'), limit(10)
      );
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (fetchedLogs.length === 0) {
          setErrorMsg("学習データが見つかりませんでした。");
      } else {
          setLogs(fetchedLogs);
          // 2. 既存の介入設定があれば取得
          const settingsSnap = await getDoc(doc(db, 'artifacts', APP_ID, 'interventions', targetUid));
          if (settingsSnap.exists()) {
              const s = settingsSnap.data();
              setInterventionFocus(s.focus || "");
              setInterventionInterest(s.interest || "");
          }
      }
    } catch (e) { setErrorMsg("データの取得に失敗しました。"); } finally { setLoading(false); }
  };

  // ログ要約生成ヘルパー (地理特化)
  const getLogSummary = () => {
    return logs.map(l => {
        const score = l.scores?.quizCorrect || 0;
        const total = l.scores?.quizTotal || 0;
        const theme = l.content?.theme || "テーマ不明";
        const visualAid = l.content?.visual_aid?.type || "図版なし";
        
        return `[${l.timestamp ? new Date(l.timestamp).toLocaleDateString() : '日時不明'}] テーマ:「${theme}」| 図版:${visualAid} | スコア:${score}/${total}`;
    }).join("\n");
  };

  // 機能1: 成績分析と指導案作成 (地理特化)
  const handleAnalyzePerformance = async () => {
    if (!targetUid || logs.length === 0) return;
    setAnalyzingPerf(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const logSummary = getLogSummary();
      const prompt = `
      あなたは「共通テスト地理の学習ストラテジスト」です。
      以下の学習ログに基づき、保護者への報告レポートと、次回のAI指導戦略を作成してください。

      【学習ログデータ】
      ${logSummary}

      【出力要件】
      1. **学習成果レポート (report)**:
         - **保護者に向けた**、直近の学習成果レポート（Markdown）。
         - 「お子様は〜」という主語で記述。
         - 単なる点数報告ではなく、「雨温図の読み取り精度が上がった」「統計データから国を推測する力がついてきた」など、地理特有の能力を分析せよ。
         - 今後の見通しを含め、保護者に安心感を与える文面にせよ。

      2. **介入：重点指導テーマ (suggested_focus)**:
         - 次回の教材生成AIに対する**技術的な指示**。
         - 例：「『ブラインド統計表』を多用し、順位の変動に着目させよ」「三角グラフの読み取り手順をステップ化して提示せよ」など。

      3. **介入：興味付け (suggested_interest)**:
         - 次回のテーマに関連する「地理的な雑学・最新の国際情勢」を提案せよ。
         - 例：「なぜその国のマクドナルドは高いのか（ビッグマック指数）」「気候変動で沈みそうな島国の現状」など。

      【出力形式: JSONのみ】
      {
        "report": "保護者向け成果報告レポート(Markdown)",
        "suggested_focus": "次回生成プロンプト用指示",
        "suggested_interest": "次回生成プロンプト用雑学"
      }
      `;
      
      const res = await callAI("成績分析", prompt, apiKey, "ADMIN_USER");
      
      if (res) {
          setAnalysisReport(res.report);
          setInterventionFocus(res.suggested_focus);
          setInterventionInterest(res.suggested_interest);
          setSuccessMsg("成績レポートと指導案が生成されました。");
      }
    } catch (e) { 
        console.error(e);
        setErrorMsg(`分析エラー: ${e.message}`); 
    } finally { setAnalyzingPerf(false); }
  };

  // 機能2: 保護者向けコラム作成 (地理特化)
  const handleGenerateColumn = async () => {
    if (!targetUid || logs.length === 0) return;
    setGeneratingCol(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const logSummary = getLogSummary();
      const prompt = `
      あなたは「地理・旅行コラムニスト」です。
      学習ログにあるテーマに関連して、保護者向けの読み応えあるコラム『地理探究だより（ジオ・レター）』を作成してください。

      【関連する学習テーマ】
      ${logSummary}

      【執筆要件 (Markdown形式)】
      以下の4部構成で、地理に詳しくない大人でも「へぇ〜」と思える知的エンタメ記事を書け。

      **(A) データの裏側**: 
      - 統計データや地図から見える、意外な世界の姿（例：日本よりスマホ普及率が高いアフリカの国など）。

      **(B) 大人のための地政学入門**: 
      - ニュースでよく見る国際問題の背景にある「地理的要因（資源、国境、海峡など）」をわかりやすく解説。

      **(C) バーチャル旅行ガイド**: 
      - テーマに関連する国や地域の、ガイドブックには載っていないディープな観光スポットや食文化を紹介。

      **(D) 食卓での会話ネタ**: 
      - 「スーパーで売ってるこのバナナ、どこから来たか知ってる？」など、子供との会話のきっかけになるクイズネタ。

      【出力形式: JSONのみ】
      {
        "parent_advice": "保護者向け教養コラム(Markdown)"
      }
      `;
      
      const res = await callAI("コラム生成", prompt, apiKey, "ADMIN_USER");
      
      if (res) {
          setParentAdvice(res.parent_advice);
          setSuccessMsg("保護者向けコラムが生成されました。");
      }
    } catch (e) { 
        console.error(e);
        setErrorMsg(`生成エラー: ${e.message}`); 
    } finally { setGeneratingCol(false); }
  };

  const handleSaveSettings = async () => {
      if (!targetUid) return;
      try {
          await setDoc(doc(db, 'artifacts', APP_ID, 'interventions', targetUid), {
              focus: interventionFocus, 
              interest: interventionInterest, 
              updatedAt: new Date().toISOString(),
              adminId: "ADMIN" 
          }, { merge: true });
          setSuccessMsg("介入設定を保存しました。");
          setTimeout(() => setSuccessMsg(null), 3000);
      } catch (e) { setErrorMsg("保存に失敗しました。"); }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Button onClick={onBack} startIcon={<ArrowLeft />} color="inherit" sx={{ fontWeight: 'bold' }}>アプリに戻る</Button>
          <Typography variant="h5" fontWeight="900" color="text.primary" sx={{ flexGrow: 1 }}>
            管理者コンソール (地理)
          </Typography>
      </Stack>

      {/* グローバル設定 */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid', borderColor: 'indigo.100', bgcolor: 'white' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" display="flex" alignItems="center" gap={1}>
                      <SettingsIcon fontSize="small"/> システム全体設定
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" mt={1}>AI動作モード</Typography>
                  <Typography variant="caption" color="text.secondary">全ユーザーの生成モデルを一括変更します</Typography>
              </Box>
              <ToggleButtonGroup
                  value={appMode}
                  exclusive
                  onChange={handleSaveGlobalSettings}
                  disabled={globalLoading}
                  size="small"
                  color="primary"
              >
                  <ToggleButton value="production" sx={{ px: 3, fontWeight: 'bold', gap: 1 }}>
                      {globalLoading ? <CircularProgress size={16}/> : <ProductionIcon fontSize="small" />} 本番
                  </ToggleButton>
                  <ToggleButton value="test" sx={{ px: 3, fontWeight: 'bold', gap: 1 }}>
                      {globalLoading ? <CircularProgress size={16}/> : <TestIcon fontSize="small" />} テスト
                  </ToggleButton>
              </ToggleButtonGroup>
          </Stack>
      </Paper>

      {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}

      {/* 生徒検索 */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: '#e2e8f0' }}>
          <Stack direction="row" spacing={2}>
              <TextField 
                label="生徒UIDを入力" 
                fullWidth 
                value={targetUid} 
                onChange={(e) => setTargetUid(e.target.value)} 
                variant="outlined" 
                size="small" 
              />
              <Button 
                variant="contained" 
                onClick={handleSearch} 
                disabled={loading || !targetUid} 
                startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SearchIcon />} 
                sx={{ px: 4, fontWeight: 'bold' }}
              >
                検索
              </Button>
          </Stack>
      </Paper>

      {/* ログ一覧とアクションボタン */}
      {logs.length > 0 && (
          <div className="animate-fade-in">
              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <ChartIcon fontSize="small"/> 学習ログ一覧
              </Typography>
              <Stack spacing={2} mb={4}>
                  {logs.map((log) => {
                      const score = log.scores?.quizCorrect || 0;
                      const total = log.scores?.quizTotal || 0;
                      return (
                          <Accordion key={log.id} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': {display: 'none'} }}>
                              <AccordionSummary expandIcon={<ChevronDown />}>
                                  <Stack direction="row" alignItems="center" spacing={2} width="100%">
                                      <Typography variant="caption" sx={{ minWidth: 80, color: 'text.secondary', fontFamily: 'monospace' }}>
                                          {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "-"}
                                      </Typography>
                                      <Box flexGrow={1}>
                                          <Typography variant="subtitle2" fontWeight="bold">{log.content?.theme || "No Theme"}</Typography>
                                          <Typography variant="caption" color="text.secondary">図版: {log.content?.visual_aid?.type || "なし"}</Typography>
                                      </Box>
                                      <Box 
                                        sx={{ 
                                            bgcolor: score >= total * 0.8 ? '#f0fdf4' : score >= total * 0.5 ? '#fefce8' : '#fef2f2',
                                            color: score >= total * 0.8 ? '#166534' : score >= total * 0.5 ? '#854d0e' : '#991b1b',
                                            px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold', fontSize: '0.8rem'
                                        }}
                                      >
                                          Score: {score}/{total}
                                      </Box>
                                  </Stack>
                              </AccordionSummary>
                              <AccordionDetails sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                  <Typography variant="body2" color="text.secondary">{log.scores?.comment || "コメントなし"}</Typography>
                              </AccordionDetails>
                          </Accordion>
                      );
                  })}
              </Stack>

              {/* アクションボタンエリア */}
              <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth
                    onClick={handleAnalyzePerformance} 
                    disabled={analyzingPerf || generatingCol} 
                    startIcon={analyzingPerf ? <CircularProgress size={20} color="inherit"/> : <AnalyticsIcon />} 
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', boxShadow: 3 }}
                  >
                    📊 学習成果を分析
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="contained" 
                    color="info"
                    fullWidth
                    onClick={handleGenerateColumn} 
                    disabled={analyzingPerf || generatingCol} 
                    startIcon={generatingCol ? <CircularProgress size={20} color="inherit"/> : <ColumnIcon />} 
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', boxShadow: 3, bgcolor: '#0ea5e9', '&:hover': {bgcolor: '#0284c7'} }}
                  >
                    ☕ 地理探究だよりを作成
                  </Button>
                </Grid>
              </Grid>

              {/* 学習成果レポート */}
              {analysisReport && (
                  <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#eef2ff', borderRadius: 3, border: '1px solid #c7d2fe' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                        📊 学習成果レポート（保護者への報告用）
                      </Typography>
                      <SafeMarkdown content={analysisReport} />
                  </Paper>
              )}

              {/* 保護者向けコラム */}
              {parentAdvice && (
                  <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#fff7ed', borderRadius: 3, border: '1px solid #fed7aa' }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={2} sx={{ color: '#ea580c' }}>
                          <GeoIcon />
                          <Typography variant="subtitle2" fontWeight="bold">
                             保護者向け通信『地理探究だより（ジオ・レター）』
                          </Typography>
                      </Stack>
                      <Divider sx={{ mb: 2, borderColor: '#ffedd5' }} />
                      <SafeMarkdown content={parentAdvice} />
                  </Paper>
              )}

              {/* 介入設定 */}
              <Paper elevation={3} sx={{ p: 4, borderRadius: 4, border: '1px solid #cbd5e1' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                      <AlertIcon color="warning"/> 次回生成への介入設定
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                      「学習成果を分析」を実行すると、ここにAI推奨の指導案が自動入力されます。手動で修正も可能です。
                  </Typography>
                  
                  <Stack spacing={3}>
                      <TextField 
                        label="重点指導テーマ (Focus)" 
                        value={interventionFocus} 
                        onChange={(e) => setInterventionFocus(e.target.value)} 
                        fullWidth multiline rows={2}
                        helperText="AIへの具体的な指導指示（例：『三角グラフ』の読み方をステップ化せよ）"
                      />
                      <TextField 
                        label="興味付け・雑学 (Interest)" 
                        value={interventionInterest} 
                        onChange={(e) => setInterventionInterest(e.target.value)} 
                        fullWidth multiline rows={2}
                        helperText="次回テーマに関連する地理的雑学"
                      />
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={handleSaveSettings} 
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                      >
                        介入設定を保存
                      </Button>
                  </Stack>
              </Paper>
          </div>
      )}
    </Container>
  );
};

export default AdminDashboard;