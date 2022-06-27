import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import axios from 'axios';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

axios.defaults.withCredentials = true;

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto',
        fontWeightRegular: 500,
    }
})

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <App />
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);