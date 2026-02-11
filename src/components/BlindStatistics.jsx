import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

const BlindStatistics = ({ data, title }) => {
  if (!data || !data.headers || !data.rows) return null;

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
        {title || '統計データ'}
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ bgcolor: 'transparent' }}
      >
        <Table size="small" aria-label="statistics table">
          <TableHead>
            <TableRow>
              {data.headers.map((header, index) => (
                <TableCell
                  key={index}
                  align={index === 0 ? 'left' : 'center'}
                  sx={{
                    fontWeight: 'bold',
                    color: '#475569',
                    fontSize: '0.85rem',
                    borderBottom: '2px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    align={cellIndex === 0 ? 'left' : 'center'}
                    component={cellIndex === 0 ? 'th' : 'td'}
                    scope={cellIndex === 0 ? 'row' : undefined}
                    sx={{
                      fontSize: '0.9rem',
                      color: cellIndex === 0 ? '#334155' : '#1e293b',
                      fontWeight: cellIndex === 0 ? 'bold' : 'normal',
                      bgcolor:
                        cellIndex === 0
                          ? 'rgba(241, 245, 249, 0.5)'
                          : 'transparent',
                    }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        display="block"
        align="right"
        sx={{ mt: 1, color: '#94a3b8', fontSize: '0.65rem' }}
      >
        ※AI生成データに基づく
      </Typography>
    </Paper>
  );
};

export default BlindStatistics;
