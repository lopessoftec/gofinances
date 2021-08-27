import React from 'react';
import { ThemeProvider } from 'styled-components';

import {}
import { Dashboard } from './src/screens/Dashboard';

export default function App() {
  return (
    <ThemeProvider thema={}>
      <Dashboard />
    </ThemeProvider>
  )
}

