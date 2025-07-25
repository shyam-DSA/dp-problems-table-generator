import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function DPTableVisualizer({ dp, category, problem, highlight, changed, filled }) {
  return (
    <TableContainer component={Paper} className="dp-table">
      <Table
        size="small"
        sx={{ '& td, & th': { border: 1, borderColor: '#000', padding: '4px', textAlign: 'center' } }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{category === 'lcs' ? 'i\\j' : 'i\\w'}</TableCell>
            {category === 'lcs' && problem.n && [...Array(problem.n + 1).keys()].map(c => (
              <TableCell key={c}>{c}</TableCell>
            ))}
            {category !== 'lcs' && problem.W && [...Array(problem.W + 1).keys()].map(w => (
              <TableCell key={w}>{w}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dp.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{i}</TableCell>
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  className={`${highlight.has(`${i}-${j}`) ? 'path-cell' : ''} ${changed.has(`${i}-${j}`) ? 'changed-cell' : ''} ${filled.has(`${i}-${j}`) ? 'filled-cell' : 'unfilled-cell'}`}
                >
                  {typeof cell === 'boolean' ? (cell ? 'T' : 'F') : cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DPTableVisualizer;
