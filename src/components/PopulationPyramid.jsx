import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

const PopulationPyramid = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  // ツールチップの値を絶対値に変換して表示
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, opacity: 0.95 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Box width={10} height={10} bgcolor={entry.color} />
              <Typography variant="caption" sx={{ color: entry.color }}>
                {entry.name}: {Math.abs(entry.value)}%
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
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
        {title || '人口ピラミッド'}
      </Typography>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            stackOffset="sign"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(val) => Math.abs(val)} // 軸のマイナス表記を消す
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              dataKey="age"
              type="category"
              width={40}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x={0} stroke="#000" />

            {/* 男性: マイナス値で左に伸ばす */}
            <Bar dataKey="male" name="男性" fill="#3b82f6" stackId="stack" />
            {/* 女性: プラス値で右に伸ばす */}
            <Bar dataKey="female" name="女性" fill="#ec4899" stackId="stack" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography
        variant="caption"
        display="block"
        align="right"
        sx={{ mt: 1, color: '#94a3b8', fontSize: '0.65rem' }}
      >
        ※AI生成データに基づく推計値 (%)
      </Typography>
    </Paper>
  );
};

export default PopulationPyramid;
