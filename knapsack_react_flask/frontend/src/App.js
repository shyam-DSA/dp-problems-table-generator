
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material';
import './App.css';

function App() {
  const [problem, setProblem] = useState({});
  const [dp, setDp] = useState([]);
  const [level, setLevel] = useState('medium');
  const [category, setCategory] = useState('knapsack');
  const [type, setType] = useState('01');
  const [solutionValue, setSolutionValue] = useState(null);
  const [insight, setInsight] = useState('');

  const fetchProblem = () => {
    fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, type })
    })
    .then(res => res.json())
    .then(data => {
      setProblem(data);
      let empty;
      if (category === 'lcs') {
        empty = Array(data.m + 1)
          .fill(null)
          .map(() => Array(data.n + 1).fill(''));
      } else {
        empty = Array(data.n + 1)
          .fill(null)
          .map(() => Array(data.W + 1).fill(''));
      }
      setDp(empty);
      setSolutionValue(null);
      setInsight('');
    });
  };

  const fetchSolution = () => {
    fetch('http://localhost:5000/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...problem, type })
    })
    .then(res => res.json())
    .then(data => {
      if (data.dp) {
        setDp(data.dp);
        if (data.result !== undefined) {
          setSolutionValue(data.result);
        } else {
          setSolutionValue(null);
        }
        setInsight(data.insight || '');
      } else if (data.value !== undefined) {
        setSolutionValue(data.value);
        setInsight(data.insight || '');
      } else {
        setInsight(data.insight || '');
      }
    });
  };

  const downloadPDF = () => {
    const element = document.getElementById('export');
    if (element) {
      const opt = {
        margin: 10,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DP Problem Generator
          </Typography>
        </Toolbar>
      </AppBar>
      <Container className="App" sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="level-label">Difficulty</InputLabel>
        <Select
          labelId="level-label"
          value={level}
          label="Difficulty"
          onChange={e => setLevel(e.target.value)}
        >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel id="cat-label">Category</InputLabel>
        <Select
          labelId="cat-label"
          value={category}
          label="Category"
          onChange={e => {
            setCategory(e.target.value);
            setType('');
          }}
        >
          <MenuItem value="knapsack">Knapsack Variation</MenuItem>
          <MenuItem value="lcs">LCS Variation</MenuItem>
        </Select>
      </FormControl>
      {category === 'knapsack' && (
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            label="Type"
            onChange={e => setType(e.target.value)}
          >
            <MenuItem value="01">0/1 Knapsack</MenuItem>
            <MenuItem value="unbounded">Unbounded Knapsack</MenuItem>
            <MenuItem value="fractional">Fractional Knapsack</MenuItem>
            <MenuItem value="subset_sum">Subset Sum</MenuItem>
            <MenuItem value="subset_partition">Subset Partition</MenuItem>
          </Select>
        </FormControl>
      )}
      {category === 'lcs' && (
        <FormControl sx={{ minWidth: 170 }} size="small">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            label="Type"
            onChange={e => setType(e.target.value)}
          >
            <MenuItem value="lcs">LCS</MenuItem>
            <MenuItem value="lcsubstring">Longest Common Substring</MenuItem>
            <MenuItem value="scs">Shortest Common Supersequence</MenuItem>
          </Select>
        </FormControl>
      )}
      <Button variant="contained" onClick={fetchProblem}>New Problem</Button>
      <Button variant="contained" onClick={fetchSolution}>Solve</Button>
      <Button variant="outlined" onClick={downloadPDF}>Download PDF</Button>
      </Box>
      <Paper id="export" sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>Problem:</Typography>
        {category === 'lcs' ? (
          <>
            <Typography variant="body2">String1: {problem.s1}</Typography>
            <Typography variant="body2" gutterBottom>String2: {problem.s2}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">Values: {JSON.stringify(problem.values)}</Typography>
            <Typography variant="body2">Weights: {JSON.stringify(problem.weights)}</Typography>
            <Typography variant="body2">Capacity: {problem.W}</Typography>
            <Typography variant="body2" gutterBottom>Items: {problem.n}</Typography>
          </>
        )}
        {solutionValue !== null && (
          <Typography variant="body2" gutterBottom>Result: {solutionValue}</Typography>
        )}
        <Typography variant="h6" gutterBottom>DP Table:</Typography>
        <TableContainer component={Paper}>
          <Table size="small" sx={{ '& td, & th': { border: 1, padding: '4px', textAlign: 'center' } }}>
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
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {insight && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {insight}
          </Typography>
        )}
      </Paper>
    </Container>
    </>
  );
}

export default App;
