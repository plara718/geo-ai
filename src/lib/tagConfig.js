/**
 * AIプロンプトに挿入するタグ定義リスト (地理版)
 */

const REGION_TAGS = [
  'region_asia: アジア（東・東南・南・西）',
  'region_europe: ヨーロッパ',
  'region_africa: アフリカ',
  'region_namerica: 北アメリカ',
  'region_samerica: 南アメリカ',
  'region_oceania: オセアニア',
  'region_russia: ロシア・旧ソ連諸国',
];

const SYSTEM_TAGS = [
  'sys_terrain: 地形（プレート・火山・造山帯）',
  'sys_climate: 気候（ケッペン区分・植生・土壌）',
  'sys_agri: 農林水産業（ホイットルシー農牧業区分）',
  'sys_resource: 資源・エネルギー（鉱産資源・電力）',
  'sys_industry: 工業・産業立地',
  'sys_population: 人口・都市・村落',
  'sys_culture: 民族・宗教・言語',
];

const MISTAKE_TAGS = [
  'err_location: 位置・分布の誤認',
  'err_causality: 因果関係の逆転',
  'err_data: 統計データの読み間違い',
  'err_term: 用語の定義・混同',
];

export const generateTagPrompt = (type) => {
  switch (type) {
    case 'ERA': // 互換性のため名前は維持しつつ中身はRegion
      return REGION_TAGS.join('\n');
    case 'THEME': // 中身はSystem
      return SYSTEM_TAGS.join('\n');
    case 'MISTAKE':
      return MISTAKE_TAGS.join('\n');
    default:
      return '';
  }
};
