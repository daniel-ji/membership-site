import React, { Component } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom"

import axios from 'axios';

import './styles/App.scss'

import Dashboard from './components/Dashboard'
import LogIn from './components/LogIn'
import SignUp from './components/SignUp'
import NotFound from './components/NotFound'


export class App extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            loggedIn: undefined
        }

        this.checkLoggedIn = this.checkLoggedIn.bind(this);
    }

    componentDidMount() {
        this.checkLoggedIn()
    }

    checkLoggedIn() {
        axios.get('/api/customers/loggedin').then(res => {
            this.setState({
                loggedIn: res.data.loggedIn
            })
        })
        .catch(err => {
            console.log(err)
            this.setState({
                loggedIn: false
            })
        })
    }

    render() {
        return (
        <div className='App'>
                <Router>
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        {/** redirecting home page to either dashboard or login*/}
                        {this.state.loggedIn ? 
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        :
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        }
                        <Route path="/dashboard" element={this.state.loggedIn ? <Dashboard checkLoggedIn={this.checkLoggedIn} /> : <Navigate to="/login" replace />} />
                        <Route path="/login" element={!this.state.loggedIn ? <LogIn checkLoggedIn={this.checkLoggedIn} /> : <Navigate to="/dashboard" replace />} />
                        <Route path="/signup" element={!this.state.loggedIn ? <SignUp checkLoggedIn={this.checkLoggedIn} /> : <Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
        </div>
        )
    }
}

export default App