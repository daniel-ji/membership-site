import React, { Component } from 'react'
import { Paper, TextField, Button } from '@mui/material';
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { KeyboardDatePicker } from "@material-ui/pickers";

const axios = require('axios');

window["nameRegex"] = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
window["emailRegex"] = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
window["passwordRegex"] = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
window["phoneRegex"] = /^[\d\-() ]{0,25}$/;
window["phoneFinalRegex"] = /^[0-9]{10,11}$/;

export class SignUp extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            name: '',
            phone: '',
            email: '',
            address: '',
            birthday: new Date('1 Jan 2000'),
            password: '',
            reenter: '',

            nameValid: true,
            phoneValid: true,
            emailValid: true,
            addressValid: true,
            birthdayValid: true,
            passwordValid: true,
            reenterValid: true,

            whitelist: ['reenter', 'birthday', 'address'],

            status: undefined,
            isStatusError: false,
        }

        this.updateValue = this.updateValue.bind(this);
        this.updateBirthday = this.updateBirthday.bind(this);
        this.validate = this.validate.bind(this);
        this.signUp = this.signUp.bind(this);
    }

    updateValue(e, category) {
        this.setState({[category]: e.target.value, [category + "Valid"]: true === this.validate(category, false, e.target.value)});
    }

    updateBirthday(birthday) {
        this.setState({birthday: birthday, birthdayValid: true});
    }

    validate(category, final = true, value = this.state[category]) {
        if ((final && value === undefined) || value.length === 0) {
            return false;
        }
        if (!this.state.whitelist.includes(category)) {
            return window[category + (final && category === 'phone' ? "Final" : "") + "Regex"].test(value);
        } else {
            switch (category) {
                case 'reenter':
                    return value === this.state.password;
                default: 
                    return true;
            }
        }
    }

    signUp() {
        this.setState({
            nameValid: this.validate('name'), 
            phoneValid: this.validate('phone'), 
            emailValid: this.validate('email'), 
            passwordValid: this.validate('password'),
            reenterValid: this.validate('reenter')
        }, () => {
            if (this.state.nameValid && this.state.phoneValid && this.state.emailValid && this.state.addressValid 
                && this.state.birthdayValid && this.state.passwordValid && this.state.reenterValid) {
                    axios.post('http://localhost:8000/api/customers/signup', {
                        name: this.state.name,
                        phone: this.state.phone,
                        email: this.state.email,
                        address: this.state.address,
                        birthday: new Date(this.state.birthday).toDateString(),
                        password: this.state.password,
                    }).then((res) =>  {
                        if (res.status === 201) {
                            this.setState({status: 'Successfully registered! Please check your email to verify your account.', isStatusError: false})
                        }
                    }).catch((err) => {
                        console.log(err); 
                        if (err.response.status === 409) {
                            this.setState({status: 'Account already exists.', isStatusError: true})
                        } else {
                            this.setState({status: 'Error creating account, please try again later.', isStatusError: true})
                        }
                    })
            }
        });
    }

    render() {
        return (
            <div className="LogIn SignUp">
                <Helmet>
                    <title>Sign Up</title>
                </Helmet>
                <Paper elevation={4}>
                    <h2>Sign Up</h2>
                    <div className='form'>
                        <TextField error={!this.state.nameValid} value={this.state.name} onChange={(e) => this.updateValue(e, 'name')} label='Full Name' />
                        <TextField error={!this.state.phoneValid} value={this.state.phone} onChange={(e) => this.updateValue(e, 'phone')} label='Phone' type='tel' />
                        <TextField error={!this.state.emailValid} value={this.state.email} onChange={(e) => this.updateValue(e, 'email')} label='Email' type='email'/>
                        <TextField error={!this.state.addressValid} value={this.state.address} onChange={(e) => this.updateValue(e, 'address')} className='address' label='Full Address' />
                        <KeyboardDatePicker
                            className="birthday"
                            error={!this.state.birthdayValid}
                            autoOk
                            variant="inline"
                            inputVariant="outlined"
                            label="Select Date"
                            format="MM/DD/yyyy"
                            minDate={new Date('1 Jan 1900')}
                            maxDate={new Date(Date.now()-13*365*24*60*60*1000)}
                            allowKeyboardControl
                            value={this.state.birthday}
                            onChange={(date) => this.updateBirthday(date)}
                            openTo="year"
                        />
                        <TextField error={!this.state.passwordValid} value={this.state.password} onChange={(e) => this.updateValue(e, 'password')} label='Create Password' type='password'/>
                        <TextField error={!this.state.reenterValid} value={this.state.reenter} onChange={(e) => this.updateValue(e, 'reenter')} label='Re-Enter Password' type='password' />
                    </div>
                    <Button variant='outlined' onClick={this.signUp}>Sign Up</Button>
                    <Button variant='outlined'><Link to='/login'>Log In</Link></Button>
                    {this.state.status !== undefined && <p style={{color: this.state.isStatusError ? 'red' : 'green'}}>{this.state.status}</p>}
                </Paper>
            </div>
        )
    }
}

export default SignUp