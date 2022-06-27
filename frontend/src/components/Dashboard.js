import React, { Component } from 'react'
import { Button } from '@mui/material';

import axios from 'axios';

import Helmet from 'react-helmet';

export class Dashboard extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            name: ''
        }

        this.getUserInfo = this.getUserInfo.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    componentDidMount() {
        this.getUserInfo();
    }

    getUserInfo() {
        axios.get('/api/customers/self').then(res => {
            this.setState({name: res.data.name})
        });
    }

    logOut() {
        axios.post('/api/customers/logout').then(res => {
            this.props.checkLoggedIn();
        });
    }

    render() {
        return (
            <div className="Dashboard">
                <Helmet>
                    <title>Dashboard</title>
                </Helmet>
                <h3>Dashboard - Hello, {this.state.name}!</h3>
                <Button onClick={this.logOut} variant='outlined'>Log Out</Button>
            </div>
        )
    }
}

export default Dashboard