import { GoogleGenerativeAI } from '@google/generative-ai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { APP_ID } from './constants';

export const callAI = async (actionName, prompt, apiKey, userId) => {
  if (!apiKey) throw new Error('APIキーが設定されていません。');

  // デフォルトモデル設定
  const modelName = 'gemini-2.5-flash';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    console.log(`[AI] ${actionName}: Requesting...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    if (!text) throw new Error('AIからの応答が空でした。');

    // JSONクリーニング (Markdown記法を削除)
    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // JSONパース試行
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // 括弧の範囲だけ抽出して再試行
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        throw new Error('AIの出力が有効なJSONではありませんでした。');
      }
    }

    return data;
  } catch (e) {
    console.error(`[AI Error] ${actionName}:`, e);
    throw new Error(e.message || 'AI通信エラーが発生しました');
  }
};
