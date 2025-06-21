
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
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
  Paper
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
      const empty = Array(data.n + 1)
        .fill(null)
        .map(() => Array(data.W + 1).fill(''));
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
        setSolutionValue(null);
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
    <Container className="App">
      <Typography variant="h4" gutterBottom>Knapsack Problem Generator</Typography>
      <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
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
      <FormControl sx={{ minWidth: 160, mr: 2 }} size="small">
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
        <FormControl sx={{ minWidth: 150, mr: 2 }} size="small">
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
      <Button variant="contained" sx={{ mr: 1 }} onClick={fetchProblem}>New Problem</Button>
      <Button variant="contained" sx={{ mr: 1 }} onClick={fetchSolution}>Solve</Button>
      <Button variant="outlined" onClick={downloadPDF}>Download PDF</Button>
      <div id="export" style={{ marginTop: 20 }}>
        <Typography variant="h6" gutterBottom>Problem:</Typography>
        <Typography variant="body2">Values: {JSON.stringify(problem.values)}</Typography>
        <Typography variant="body2">Weights: {JSON.stringify(problem.weights)}</Typography>
        <Typography variant="body2">Capacity: {problem.W}</Typography>
        <Typography variant="body2" gutterBottom>Items: {problem.n}</Typography>
        {solutionValue !== null && (
          <Typography variant="body2" gutterBottom>Max Value: {solutionValue}</Typography>
        )}
        <Typography variant="h6" gutterBottom>DP Table:</Typography>
        <TableContainer component={Paper}>
          <Table size="small" sx={{ '& td, & th': { border: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>i\\w</TableCell>
                {problem.W && [...Array(problem.W + 1).keys()].map(w => (
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
      </div>
    </Container>
  );
}

export default App;
