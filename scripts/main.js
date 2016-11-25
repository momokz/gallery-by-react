var React = require('react');
var ReactDOM = require('react-dom');
var Hello = require('./handle');

// css
require('../css/main.css');

ReactDOM.render(
    <Hello/>,
    document.getElementById('content')
);