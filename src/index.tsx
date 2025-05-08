import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2DD4BF',
      light: '#5EEAD4',
      dark: '#14B8A6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    energy: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
