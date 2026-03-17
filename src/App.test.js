import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app title', () => {
  render(<App />);
  const headingElement = screen.getByText(/mtg booster sim/i);
  expect(headingElement).toBeInTheDocument();
});
