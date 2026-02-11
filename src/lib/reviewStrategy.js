import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { APP_ID } from './constants';

export const getReviewStrategy = async (userId) => {
  if (!userId) return null;

  // 1. 直近30回分の学習履歴を取得
  const historyRef = collection(
    db,
    'artifacts',
    APP_ID,
    'users',
    userId,
    'daily_progress'
  );
  const q = query(historyRef, orderBy('completedAt', 'desc'), limit(30));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  // 2. タグごとに正答率を集計
  const stats = {
    region: {}, // 地域タグ集計
    system: {}, // 系統タグ集計
    mistake: {}, // ミスパターン集計
  };

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.quizResults) return;

    data.quizResults.forEach((res) => {
      // res.tags配列に含まれるタグを集計
      if (res.tags && Array.isArray(res.tags)) {
        res.tags.forEach((tag) => {
          let category = null;
          if (tag.startsWith('region_')) category = 'region';
          else if (tag.startsWith('sys_')) category = 'system';
          else if (tag.startsWith('err_')) category = 'mistake';

          if (category) {
            if (!stats[category][tag])
              stats[category][tag] = { correct: 0, total: 0 };
            stats[category][tag].total++;
            if (res.is_correct) stats[category][tag].correct++;
          }
        });
      }
    });
  });

  // 3. 最も正答率が低い（かつ3回以上解いている）タグを探す
  const findWeakness = (category) => {
    let worstTag = null;
    let minRate = 1.0;

    Object.entries(stats[category]).forEach(([tag, val]) => {
      if (val.total < 3) return; // データ不足は除外
      const rate = val.correct / val.total;
      if (rate < minRate) {
        minRate = rate;
        worstTag = tag;
      }
    });
    return worstTag;
  };

  const weakRegion = findWeakness('region');
  const weakSystem = findWeakness('system');

  // データ不足の場合はnullを返す（StartScreenで非表示にするため）
  if (!weakRegion && !weakSystem) return null;

  // 4. 戦略データの生成
  // タグIDから日本語ラベルへの変換（簡易版）
  const getLabel = (tag) => {
    if (!tag) return '全範囲';
    const labels = {
      region_asia: 'アジア',
      region_europe: 'ヨーロッパ',
      region_africa: 'アフリカ',
      region_namerica: '北米',
      region_samerica: '南米',
      region_oceania: 'オセアニア',
      sys_climate: '気候・植生',
      sys_agri: '農牧業',
      sys_industry: '工業',
      sys_resource: '資源',
      sys_population: '人口',
      sys_culture: '文化・宗教',
    };
    return labels[tag] || tag;
  };

  return {
    target_region: weakRegion || 'region_asia', // デフォルト
    target_system: weakSystem || 'sys_climate',
    target_region_label: getLabel(weakRegion),
    target_system_label: getLabel(weakSystem),
    reason: `正答率が低迷しています（地域:${
      Math.round(
        (stats.region[weakRegion]?.correct / stats.region[weakRegion]?.total) *
          100
      ) || 0
    }%, 分野:${
      Math.round(
        (stats.system[weakSystem]?.correct / stats.system[weakSystem]?.total) *
          100
      ) || 0
    }%）。集中対策を行いましょう。`,
  };
};
