import React from 'react';
import { render } from 'react-dom';
import ChPages from './components/Chinese/ChPages';
import LandingCH from './components/Chinese/LandingCH';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

class App extends React.Component {
  render() {
    return (
      <Router history={browserHistory} >
        <Route path="/" component={ChPages}>
          <IndexRoute component={LandingCH} />
        </Route>
      </Router>
    );
  }
}

render(<App />, document.getElementById('app'));