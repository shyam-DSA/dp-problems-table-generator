
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
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
    html2pdf().from(element).save('knapsack_solution.pdf');
  };

  return (
    <div className="App">
      <h1>Knapsack Problem Generator</h1>
      <div>
        <label>Difficulty:</label>
        <select value={level} onChange={e => setLevel(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={fetchProblem}>New Problem</button>
        <button onClick={fetchSolution}>Solve</button>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>
      <div id="export">
        <h2>Problem:</h2>
        <p>Values: {JSON.stringify(problem.values)}</p>
        <p>Weights: {JSON.stringify(problem.weights)}</p>
        <p>Capacity: {problem.W}</p>
        <p>Items: {problem.n}</p>
        <h2>DP Table:</h2>
        <table border="1">
          <thead>
            <tr>
              <th>i\w</th>
              {problem.W && [...Array(problem.W + 1).keys()].map(w => <th key={w}>{w}</th>)}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, i) => (
              <tr key={i}>
                <td>{i}</td>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
