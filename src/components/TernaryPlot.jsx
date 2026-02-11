import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TernaryPlot = ({ data, title, labels = ['A', 'B', 'C'] }) => {
  if (!data || !Array.isArray(data)) return null;

  // 三角形のサイズ設定
  const size = 300;
  const h = size * Math.sin(Math.PI / 3); // 高さ
  const padding = 40;

  // 座標変換関数 (3つの％値をX,Y座標に変換)
  // a: 底辺(左→右), b: 右辺(下→上), c: 左辺(上→下) の想定
  // ここでは一般的な地理のグラフに合わせて調整
  // 上頂点: c (100%), 右下: a (100%), 左下: b (100%) と仮定してマッピング
  const getPoints = (a, b, c) => {
    // 正規化（合計が100になるように）
    const total = a + b + c;
    const normA = a / total;
    const normB = b / total;
    const normC = c / total;

    // 座標計算 (正三角形の重心座標系)
    // 左下(0, h)を原点的に考える
    const x = 0.5 * size * (2 * normA + normC);
    const y = size - size * Math.sin(Math.PI / 3) * (normC + normA * 0); // 簡易補正

    // もっと単純な重心座標変換:
    // x = (A * xA + B * xB + C * xC)
    // y = (A * yA + B * yB + C * yC)
    // A(右下), B(上), C(左下) とする場合
    // A(size, h), B(size/2, 0), C(0, h)

    // 地理でよくある配置:
    // 軸1(底辺): 左から右へ増加
    // 軸2(右辺): 下から上へ増加
    // 軸3(左辺): 上から下へ増加

    // データ構造: item.a (右下成分), item.b (上成分), item.c (左下成分)
    const xPos = (a * size + b * (size / 2)) / 100;
    const yPos = h - (b * h) / 100;

    return { x: xPos, y: yPos };
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
      }}
    >
      <Typography
        variant="subtitle2"
        align="center"
        fontWeight="bold"
        gutterBottom
        sx={{ color: '#475569' }}
      >
        {title || '三角グラフ'}
      </Typography>

      <Box display="flex" justifyContent="center" sx={{ overflow: 'visible' }}>
        <svg
          width={size + padding * 2}
          height={h + padding * 2}
          viewBox={`-${padding} -${padding} ${size + padding * 2} ${
            h + padding * 2
          }`}
        >
          {/* 三角形の枠線 */}
          <polygon
            points={`0,${h} ${size},${h} ${size / 2},0`}
            fill="white"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* グリッド線 (20%刻み) */}
          {[20, 40, 60, 80].map((p) => {
            const y = h - (h * p) / 100;
            const xLeft = (h - y) / Math.sqrt(3);
            const xRight = size - xLeft;
            // 水平線など、本来は3方向引くべきだが視認性のため簡易化
            return (
              <line
                key={p}
                x1={xLeft}
                y1={y}
                x2={xRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* ラベル */}
          <text
            x={size / 2}
            y={-10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#64748b"
          >
            {labels[1]}
          </text>
          <text
            x={size + 10}
            y={h + 15}
            textAnchor="start"
            fontSize="12"
            fontWeight="bold"
            fill="#64748b"
          >
            {labels[0]}
          </text>
          <text
            x={-10}
            y={h + 15}
            textAnchor="end"
            fontSize="12"
            fontWeight="bold"
            fill="#64748b"
          >
            {labels[2]}
          </text>

          {/* データ点プロット */}
          {data.map((item, i) => {
            // item: { name: "国A", a: 50, b: 20, c: 30 }
            // a:右下成分, b:上成分, c:左下成分
            const pos = getPoints(item.a, item.b, item.c);
            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={pos.x + 8}
                  y={pos.y}
                  fontSize="10"
                  fill="#1e293b"
                  fontWeight="bold"
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      <Typography
        variant="caption"
        display="block"
        align="right"
        sx={{ mt: 1, color: '#94a3b8', fontSize: '0.65rem' }}
      >
        ※上:{labels[1]} 右:{labels[0]} 左:{labels[2]}
      </Typography>
    </Paper>
  );
};

export default TernaryPlot;
