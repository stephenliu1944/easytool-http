import React, { Component } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import "./Frame.css"

export default class Frame extends Component {
    render() {
        return (
        	<div className="frame">
        		<Header />
        		<div className="container">
        			{this.props.children}
        		</div>
        		<Footer />
        	</div>
        );
    }
}

