const React = require('react');
const ReactDOM = require('react-dom');
const injectTapEventPlugin = require('react-tap-event-plugin');
const Velocity = require('velocity-animate');

require('./js/DataRepair')();

const overlay = document.getElementById('overlay');

injectTapEventPlugin();
setTimeout(() => {
  const Chad = require('./Chad');
  ReactDOM.render(
    <Chad />,
    document.getElementById('container')
  );
  Velocity(overlay, 'fadeOut', { duration: 500 });
}, 10);
