import React, { Component } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom"

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
                        {this.state.loggedIn && <Route path="/dashboard" element={<Dashboard />} />}
                        {!this.state.loggedIn && <Route path="/login" element={<LogIn />} />}
                        {!this.state.loggedIn && <Route path="/signup" element={<SignUp />} />}
                    </Routes>
                </Router>

        </div>
        )
    }
}

export default App