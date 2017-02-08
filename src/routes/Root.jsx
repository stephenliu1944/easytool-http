import React, { Component } from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Frame from '../layouts/frame/Frame';
import Home from '../views/home/Home';

export default class Root extends Component {
    render() {
        return (
            <Router history={hashHistory} >
                <Route path="/" component={Frame} >
                    <IndexRoute component={Home} />
                </Route>
            </Router>
        );
    }
}

