import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme({
    typography: {
        fontFamily: 'Roboto',
        fontWeightRegular: 500,
    }
})

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);