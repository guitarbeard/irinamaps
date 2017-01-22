import React from "react";

import ReactDOM from "react-dom";

const Root = ( require(`./App`).default );

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import "./index.css";

ReactDOM.render(
  <Root />,
  document.getElementById(`root`)
);
