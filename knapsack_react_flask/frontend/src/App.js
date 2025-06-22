
import React, { useState, useEffect } from 'react';
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
  Paper,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import './App.css';
import DPTableVisualizer from './DPTableVisualizer';

function App() {
  const [problem, setProblem] = useState({});
  const [dp, setDp] = useState([]);
  const [level, setLevel] = useState('medium');
  const [category, setCategory] = useState('knapsack');
  const [type, setType] = useState('01');
  const [solutionValue, setSolutionValue] = useState(null);
  const [insight, setInsight] = useState('');
  const [items, setItems] = useState([]);
  const [possible, setPossible] = useState(null);
  const [target, setTarget] = useState(null);
  const [dpStates, setDpStates] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMode, setStepMode] = useState(false);
  const [path, setPath] = useState([]);
  const [highlight, setHighlight] = useState(new Set());
  const [changed, setChanged] = useState(new Set());
  const [formula, setFormula] = useState('');

  useEffect(() => {
    setFormula('');
  }, [stepMode]);

  useEffect(() => {
    if (!stepMode && dpStates.length > 0) {
      setDp(dpStates[0]);
      let i = 0;
      const id = setInterval(() => {
        i += 1;
        if (i < dpStates.length) {
          setDp(dpStates[i]);
        } else {
          clearInterval(id);
          setDp(dpStates[dpStates.length - 1]);
          const setH = new Set(path.map(p => `${p[0]}-${p[1]}`));
          setHighlight(setH);
        }
      }, 300);
      return () => clearInterval(id);
    }
  }, [dpStates, path, stepMode]);

  useEffect(() => {
    if (stepMode && steps.length > 0) {
      const curr = steps[currentStep];
      setDp(curr);
      if (currentStep > 0) {
        const prev = steps[currentStep - 1];
        const changedSet = new Set();
        let firstChange = null;
        for (let i = 0; i < curr.length; i++) {
          for (let j = 0; j < curr[0].length; j++) {
            if (curr[i][j] !== prev[i][j]) {
              changedSet.add(`${i}-${j}`);
              if (!firstChange) firstChange = { i, j };
            }
          }
        }
        setChanged(changedSet);
        if (firstChange) {
          const i = firstChange.i;
          const j = firstChange.j;
          let f = '';
          if (type === '01') {
            if (problem.weights[i - 1] <= j) {
              const without = prev[i - 1][j];
              const withItem = problem.values[i - 1] + prev[i - 1][j - problem.weights[i - 1]];
              f = `dp[${i}][${j}] = max(${without}, ${withItem}) = ${curr[i][j]}`;
            } else {
              f = `dp[${i}][${j}] = ${prev[i - 1][j]}`;
            }
          } else if (type === 'unbounded') {
            if (problem.weights[i - 1] <= j) {
              const without = prev[i - 1][j];
              const withItem = problem.values[i - 1] + curr[i][j - problem.weights[i - 1]];
              f = `dp[${i}][${j}] = max(${without}, ${withItem}) = ${curr[i][j]}`;
            } else {
              f = `dp[${i}][${j}] = ${prev[i - 1][j]}`;
            }
          } else if (type === 'subset_sum' || type === 'subset_partition') {
            if (problem.values[i - 1] <= j) {
              const without = prev[i - 1][j];
              const withItem = prev[i - 1][j - problem.values[i - 1]];
              f = `dp[${i}][${j}] = ${without} || ${withItem} = ${curr[i][j]}`;
            } else {
              f = `dp[${i}][${j}] = ${prev[i - 1][j]}`;
            }
          }
          setFormula(f);
        }
      } else {
        setChanged(new Set());
        setFormula('');
      }
      if (currentStep === steps.length - 1) {
        const setH = new Set(path.map(p => `${p[0]}-${p[1]}`));
        setHighlight(setH);
      } else {
        setHighlight(new Set());
      }
    }
  }, [steps, currentStep, stepMode, path]);

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
      setItems([]);
      setPossible(null);
      setTarget(null);
      setDpStates([]);
      setSteps([]);
      setCurrentStep(0);
      setPath([]);
      setHighlight(new Set());
      setChanged(new Set());
      setFormula('');
    });
  };

  useEffect(() => {
    if (type) {
      fetchProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, category, type]);

  const fetchSolution = () => {
    let url = 'http://localhost:5000/solve';
    if (stepMode && type === '01') {
      url = 'http://localhost:5000/solve_steps';
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...problem, type })
    })
    .then(res => res.json())
    .then(data => {
      if (stepMode) {
        const stepData = data.steps || data.states || [];
        setSteps(stepData);
        setCurrentStep(0);
        setDp(stepData.length > 0 ? stepData[0] : data.dp);
        setPath(data.path || []);
        setItems(data.items || []);
        setInsight(data.insight || '');
        setDpStates([]);
      } else if (data.value !== undefined) {
        setSolutionValue(data.value);
        setInsight(data.insight || '');
        setItems([]);
        setPossible(null);
        setTarget(null);
      } else {
        setDpStates(data.states || []);
        setDp(data.dp);
        setInsight(data.insight || '');
        setItems(data.items || []);
        setPossible(data.hasOwnProperty('possible') ? data.possible : null);
        setTarget(data.hasOwnProperty('target') ? data.target : null);
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
      <FormControlLabel
        control={<Checkbox checked={stepMode} onChange={e => setStepMode(e.target.checked)} />}
        label="Step Mode"
      />
      <Button variant="contained" onClick={fetchProblem}>New Problem</Button>
      <Button variant="contained" onClick={fetchSolution}>Solve</Button>
      {stepMode && steps.length > 0 && (
        <>
          <Button variant="outlined" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>Prev</Button>
          <Button variant="outlined" onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}>Next</Button>
        </>
      )}
      <Button variant="outlined" onClick={downloadPDF}>Download PDF</Button>
      </Box>
      <Paper id="export" sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>Problem:</Typography>
        {category === 'lcs' ? (
          <>
            <Typography variant="body2">String 1: {problem.s1}</Typography>
            <Typography variant="body2">String 2: {problem.s2}</Typography>
            <Typography variant="body2">Length m: {problem.m}</Typography>
            <Typography variant="body2" gutterBottom>Length n: {problem.n}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">Values: {JSON.stringify(problem.values)}</Typography>
            {type !== 'subset_sum' && type !== 'subset_partition' && (
              <Typography variant="body2">Weights: {JSON.stringify(problem.weights)}</Typography>
            )}
            <Typography variant="body2">Capacity: {problem.W}</Typography>
            <Typography variant="body2" gutterBottom>Items: {problem.n}</Typography>
          </>
        )}
        {solutionValue !== null && (
          <Typography variant="body2" gutterBottom>Result: {solutionValue}</Typography>
        )}
        <Typography variant="h6" gutterBottom>DP Table:</Typography>
        <DPTableVisualizer dp={dp} category={category} problem={problem} highlight={highlight} changed={changed} />
        {formula && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {formula}
          </Typography>
        )}
        {items.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected item indices: {JSON.stringify(items)}
          </Typography>
        )}
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
