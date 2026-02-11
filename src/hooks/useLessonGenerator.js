import { useState } from 'react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { callAI } from '../lib/api';
import { APP_ID, DIFFICULTY_DESCRIPTIONS } from '../lib/constants';
import { getTodayString } from '../lib/utils';

export const useLessonGenerator = (apiKey, userId) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [genError, setGenError] = useState(null);

  // 今日のレッスンデータ取得
  const fetchTodayLesson = async (sessionNum) => {
    if (!userId) return null;
    const today = getTodayString();
    const docRef = doc(
      db,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'daily_progress',
      `${today}_${sessionNum}`
    );
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) return snap.data();
    } catch (e) {
      console.error('Fetch error:', e);
    }
    return null;
  };

  // 進捗保存
  const saveProgress = async (sessionNum, progressData) => {
    if (!userId) return;
    const today = getTodayString();
    const docRef = doc(
      db,
      'artifacts',
      APP_ID,
      'users',
      userId,
      'daily_progress',
      `${today}_${sessionNum}`
    );
    try {
      await setDoc(docRef, progressData, { merge: true });
    } catch (e) {
      console.error('Save progress error:', e);
    }
  };

  /**
   * 共通テスト地理特化レッスン生成
   */
  const generateDailyLesson = async (
    learningMode,
    difficulty,
    selectedUnit,
    sessionNum,
    reviewContext = null
  ) => {
    if (!apiKey || !userId) {
      setGenError('APIキーまたはユーザーIDが不足しています');
      return null;
    }

    setIsProcessing(true);
    setGenError(null);

    try {
      const diffSetting =
        DIFFICULTY_DESCRIPTIONS[learningMode]?.[difficulty] ||
        DIFFICULTY_DESCRIPTIONS.general.standard;

      let targetUnit = selectedUnit;
      if (learningMode === 'review' && reviewContext) {
        targetUnit = `${reviewContext.target_region}における${reviewContext.target_system}の弱点克服`;
      }

      // --- Step 1: Plan ---
      const planPrompt = `
      あなたは共通テスト地理のプロ講師です。
      「${targetUnit}」という分野において、受験生が最もつまずきやすいテーマを1つ選定してください。
      
      【設定】
      - 難易度: ${diffSetting.label} (${diffSetting.ai})
      - 目的: 知識の暗記ではなく、「なぜそうなるか」の因果関係と「統計・図表の読み取り」をマスターさせる。

      【出力JSON】
      {
        "theme": "授業テーマ（例：東南アジアの工業化と変化）",
        "key_concepts": ["概念1", "概念2"],
        "strategic_essence": "この単元の肝となる考え方",
        "visual_aid_type": "このテーマに最適な図版タイプ (climate_chart / population_pyramid / statistics_table / ternary_plot)"
      }
      `;

      const planRes = await callAI(
        '授業プラン作成',
        planPrompt,
        apiKey,
        userId
      );
      if (!planRes || !planRes.theme)
        throw new Error('プラン生成に失敗しました');

      // --- Step 2: Draft ---
      const draftPrompt = `
      テーマ「${planRes.theme}」に基づき、共通テスト形式の教材を作成してください。

      【必須要件】
      1. 記述問題なし。図版データ(visual_aid)を生成し、それに基づく問題を出すこと。
      2. 重要用語リスト(essential_terms)を作成すること。

      【図版データ生成ルール】
      テーマに応じて最適な図版タイプ(visual_aid.type)を1つ選んで生成せよ。

      Type A: "climate_chart" (雨温図)
      - data: [{"name":"1月", "temp":25, "rain":100}, ...] (12ヶ月分)

      Type B: "population_pyramid" (人口ピラミッド)
      - data: [
          {"age":"0-4", "male": -5.2, "female": 4.9},
          {"age":"5-9", "male": -5.5, "female": 5.2},
          ... (0歳から80歳以上まで5歳刻み程度。男性はマイナス値、女性はプラス値)
        ]
      - 注意: 発展途上国なら「富士山型」、先進国なら「つぼ型」など、特徴を数値に反映させること。

      Type C: "statistics_table" (ブラインド統計表)
      - data: {
          "headers": ["指標", "国A", "国B", "国C"],
          "rows": [
             ["主な輸出品", "原油", "自動車", "鉄鉱石"],
             ["1人あたりGNI", "高", "中", "高"],
             ...
          ]
        }
      - 狙い: 国名を伏せ(国A,B...)、統計値の特徴から国や都市を特定させる問題を作れ。

      Type D: "ternary_plot" (三角グラフ)
      - data: [
          {"name":"国A", "a": 10, "b": 70, "c": 20}, 
          {"name":"国B", "a": 50, "b": 10, "c": 40}
        ]
      - labels: ["第1次(右下)", "第2次(上)", "第3次(左下)"] (テーマに応じてラベル変更可)
      - a+b+c=100 になること。

      【出力JSON形式】
      {
        "theme": "${planRes.theme}",
        "lecture": "Markdown形式の講義テキスト。",
        
        "visual_aid": {
          "type": "${planRes.visual_aid_type}", 
          "title": "図版タイトル(例: ナイジェリアの人口構成)",
          "data": ... (上記ルールのいずれか),
          "labels": ... (ternary_plotの場合のみ)
        },

        "questions": [
          {
            "type": "combination", 
            "q": "問題文...",
            "options": ["①...", "②...", "③...", "④..."],
            "correct": 0, 
            "exp": "解説...",
            "thinking_process": "思考手順..."
          }
        ],

        "essential_terms": [
          { "term": "用語名", "def": "解説", "category": "地域 or 系統" }
        ]
      }
      `;

      const draftRes = await callAI(
        'コンテンツ執筆',
        draftPrompt,
        apiKey,
        userId
      );
      if (!draftRes || !draftRes.lecture)
        throw new Error('教材生成に失敗しました');

      // コンテンツ結合
      const lessonData = {
        content: draftRes,
        timestamp: new Date().toISOString(),
        learningMode,
        difficulty,
        completed: false,
        userAnswers: {},
        currentStep: 'lecture',
        scores: {
          quizCorrect: 0,
          quizTotal: 0,
          nextAction: null,
        },
      };

      await saveProgress(sessionNum, lessonData);

      // 用語の自動保存処理 (バックグラウンド)
      if (draftRes.essential_terms && Array.isArray(draftRes.essential_terms)) {
        draftRes.essential_terms.forEach(async (item) => {
          if (!item.term) return;
          try {
            const termRef = doc(
              db,
              'artifacts',
              APP_ID,
              'users',
              userId,
              'vocabulary',
              item.term
            );
            await setDoc(
              termRef,
              {
                term: item.term,
                def: item.def,
                category: item.category || 'general',
                lastSeenAt: new Date().toISOString(),
                encounterCount: increment(1),
              },
              { merge: true }
            );
          } catch (e) {
            console.error('用語保存エラー', e);
          }
        });
      }

      return lessonData;
    } catch (e) {
      console.error(e);
      setGenError(e.message || '生成中にエラーが発生しました');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    generateDailyLesson,
    fetchTodayLesson,
    saveProgress,
    isProcessing,
    genError,
  };
};

