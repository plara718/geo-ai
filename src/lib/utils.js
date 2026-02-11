// 今日の日付を "YYYY-MM-DD" 形式で取得
export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};

// 画面トップへスクロール
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// レッスンデータの形式チェック（簡易版）
export const validateLessonData = (data) => {
  if (!data || !data.content) return null;
  return data;
};
