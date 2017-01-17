import React from 'react';
import ReactDOM from 'react-dom';
import IrinaMaps from './IrinaMaps';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import './index.css';

ReactDOM.render(
  <IrinaMaps  className="mdl-layout mdl-js-layout" />,
  document.getElementById('App')
);
