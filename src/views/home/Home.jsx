import './Home.css'
import React, { Component } from 'react'

export default class Home extends Component {
    render() {
        return (
            <div className="inner-container">
               <div className="top">
                   <span>报告首次生成后，可再次点击“获取最新”更新报告内容（例如工商变更等数据）</span>
               </div>
                <h1>Home</h1>
            </div>
        );
    }
}

