
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

  const fetchProblem = () => {
    fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    })
    .then(res => res.json())
    .then(setProblem);
  };

  const fetchSolution = () => {
    fetch('http://localhost:5000/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem)
    })
    .then(res => res.json())
    .then(data => setDp(data.dp));
  };

  const downloadPDF = () => {
    const element = document.getElementById('export');
    if (element) {
      html2pdf(element);
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
      <Button variant="contained" sx={{ mr: 1 }} onClick={fetchProblem}>New Problem</Button>
      <Button variant="contained" sx={{ mr: 1 }} onClick={fetchSolution}>Solve</Button>
      <Button variant="outlined" onClick={downloadPDF}>Download PDF</Button>
      <div id="export" style={{ marginTop: 20 }}>
        <Typography variant="h6" gutterBottom>Problem:</Typography>
        <Typography variant="body2">Values: {JSON.stringify(problem.values)}</Typography>
        <Typography variant="body2">Weights: {JSON.stringify(problem.weights)}</Typography>
        <Typography variant="body2">Capacity: {problem.W}</Typography>
        <Typography variant="body2" gutterBottom>Items: {problem.n}</Typography>
        <Typography variant="h6" gutterBottom>DP Table:</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
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
      </div>
    </Container>
  );
}

export default App;
