import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: null }
  }

  async componentDidMount() {
    const response = await fetch('/express_backend');
    const body = await response.json();

    console.log(body);
    console.log(body.message)

    this.setState({ data: body.message })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.data}
        </header>
      </div>
    );
  }
}


export default App;
