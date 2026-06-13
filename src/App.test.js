import { render, screen } from '@testing-library/react';
import App from './App';

test('renders essay evaluator heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /GRE Essay Evaluator/i })).toBeInTheDocument();
});

test('renders topic and essay inputs', () => {
  render(<App />);
  expect(screen.getByLabelText(/Essay Topic/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Essay Content/i)).toBeInTheDocument();
});

test('renders evaluate button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Evaluate Essay/i })).toBeInTheDocument();
});
