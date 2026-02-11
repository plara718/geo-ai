import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

const ClimateChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

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
        {title || '雨温図データ'}
      </Typography>

      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              scale="band"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            {/* 左軸：降水量 (mm) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 10, fill: '#3b82f6' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'mm',
                position: 'insideTopLeft',
                offset: 0,
                fontSize: 10,
                fill: '#3b82f6',
              }}
            />

            {/* 右軸：気温 (℃) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#ef4444' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: '℃',
                position: 'insideTopRight',
                offset: 0,
                fontSize: 10,
                fill: '#ef4444',
              }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

            {/* グラフ本体 */}
            <Bar
              yAxisId="left"
              dataKey="rain"
              name="降水量"
              barSize={12}
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temp"
              name="気温"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      <Typography
        variant="caption"
        display="block"
        align="right"
        sx={{ mt: 1, color: '#94a3b8', fontSize: '0.65rem' }}
      >
        ※AI生成データに基づく推計値
      </Typography>
    </Paper>
  );
};

export default ClimateChart;
