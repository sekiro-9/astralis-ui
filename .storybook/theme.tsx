// .storybook/withTheme.jsx (or .tsx if you prefer)
import React from 'react';
import { AstralisProvider } from '../src/theme';

export const withTheme = (Story, context) => {
  // Get theme from story parameters or use default
  const theme = context.parameters.theme || context.globals.theme || 'light';
  
  return (
    <AstralisProvider defaultTheme={theme}>
      <div style={{ padding: '2rem', minHeight: '100vh' }}>
        <Story />
      </div>
    </AstralisProvider>
  );
};