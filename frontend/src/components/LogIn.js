import React, { Component } from 'react'
import { Paper, TextField, Button } from '@mui/material';
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

export class LogIn extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
        }
    }

    render() {
        return (
            <div className="LogIn">
                <Helmet>
                    <title>Log In</title>
                </Helmet>
                <Paper elevation={4}>
                    <h2>Log In</h2>
                    <TextField label='Email' type='email'/>
                    <TextField label='Password' type='password'/>
                    <Button variant='outlined'>Log In</Button>
                    <Button variant='outlined'><Link to='/signup'>Sign Up</Link></Button>
                </Paper>
            </div>
        )
    }
}

export default LogIn