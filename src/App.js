import {
  default as React,
  Component,
} from "react";

import {
  useRouterHistory,
  Router,
  Route,
  IndexRoute,
  Redirect,
} from "react-router";

import {
  createHistory,
} from "history";

import {
  Application,
} from "./containers";

import {
  Irinamaps,
} from "./Irinamaps";

const history = useRouterHistory(createHistory)({
  basename: ``,
});

export default class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Route path="/" component={Application}>
          <IndexRoute component={Irinamaps} />
          <Redirect path="*" to="/" />
        </Route>
      </Router>
    );
  }
}
