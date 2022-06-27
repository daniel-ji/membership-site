import React, { Component } from 'react'
import { Paper, TextField, Button } from '@mui/material';
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import axios from 'axios';
import validator from 'validator';

export class LogIn extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            'email': '',
            'password': '',

            'emailValid': true,
            'passwordValid': true,

            'success': '',
            'error': '',
        }

        this.updateValue = this.updateValue.bind(this);
        this.logIn = this.logIn.bind(this);
    }

    validate(category, final = true, value = this.state[category]) {
        if (!final) {
            return true;
        }
        switch (category) {
            case 'name':
                return /^(?![\s.]+$)[a-zA-Z\s.]*$/.test(value);
            case 'email':
                return validator.isEmail(value);
            case 'password':
                return validator.isStrongPassword(value);
            case 'phone':
                return validator.isPhoneNumber(value);
            case 'reenter':
                return value === this.state.password;
            default: 
                return true;
        }
    }

    updateValue(e, category, validate = true, final = false) {
        this.setState({[category]: e.target.value, [category + "Valid"]: !validate || this.validate(category, final, e.target.value)});
    }

    logIn() {
        this.setState({
            'emailValid': this.validate('email'),
            'passwordValid': this.validate('password'),
        }, () => {
            if (this.state.emailValid && this.state.passwordValid) {
                axios.post('/api/customers/login', {
                    username: this.state.email,
                    password: this.state.password
                }).then(res => {
                    this.setState({success: 'Logged in.', error: ''}, () => {
                        this.props.checkLoggedIn();
                    });
                }).catch(err => {
                    if (err.response.status === 401) {
                        this.setState({'error': 'Invalid email or password.', success: ''});
                    } else {
                        this.setState({'error': 'Please try again at another time.', success: ''});
                    }
                })
            } else {
                this.setState({'error': 'Invalid email or password', success: ''});
            }
        })
    }

    render() {
        return (
            <div className="LogIn">
                <Helmet>
                    <title>Log In</title>
                </Helmet>
                <Paper elevation={4}>
                    <h2>Log In</h2>
                    <TextField error={!this.state.emailValid} value={this.state.email} onChange={(e) => this.updateValue(e, 'email')} label='Email' type='email'/>
                    <TextField error={!this.state.passwordValid} value={this.state.password} onChange={(e) => this.updateValue(e, 'password', false)} label='Password' type='password'/>
                    <Button onClick={this.logIn} variant='outlined'>Log In</Button>
                    <Button variant='outlined'><Link to='/signup'>Sign Up</Link></Button>
                    {this.state.error.length !== 0 && <p>{this.state.error}</p>}
                    {this.state.success.length !== 0 && <p>{this.state.success}</p>}
                </Paper>
            </div>
        )
    }
}

export default LogIn