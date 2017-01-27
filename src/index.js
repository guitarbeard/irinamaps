import React from 'react';

import ReactDOM from 'react-dom';

const Root = ( require(`./App`).default );

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import './index.scss';
import 'animate.css';

ReactDOM.render(
  <Root />,
  document.getElementById(`root`)
);
