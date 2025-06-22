import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

jest.mock('html2pdf.js', () => ({ __esModule: true, default: jest.fn() }));
global.fetch = jest.fn(url => {
  if (url.includes('generate')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ values: [1], weights: [1], W: 1, n: 1 })
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ dp: [[0,0],[0,1]], steps: [[[0,0],[0,1]]] })
  });
});

// Basic integration test to verify step mode shows navigation buttons
// for LCS problems.
test('step mode shows navigation', async () => {
  render(<App />);

  // enable step mode
  userEvent.click(screen.getByLabelText(/Step Mode/i));

  // request new problem and solve
  userEvent.click(screen.getByText(/New Problem/i));
  userEvent.click(screen.getByText(/Solve/i));

  await waitFor(() => expect(screen.getByText(/Next/i)).toBeInTheDocument());
});
