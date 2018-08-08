import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import Graph from './Graph';
import { graphData } from '../graphHelper';
import LineGraph from './LineGraph';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Graph data={graphData} />
        {/* <LineGraph data={graphData} /> */}
      </div>
    );
  }
}

export default App;
