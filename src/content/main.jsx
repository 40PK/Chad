const overlay = document.getElementById('overlay');
let instance = null;

setTimeout(() => {
  window.React = require('react');
  const { render } = require('react-dom');
  const injectTapEventPlugin = require('react-tap-event-plugin');
  const deepForceUpdate = require('react-deep-force-update');
  const Velocity = require('velocity-animate');
  require('./js/DataRepair')();

  injectTapEventPlugin();

  function deepUpdate() {
    deepForceUpdate(instance);
  }

  const Chad = require('./Chad');

  instance = render(
    <Chad deepForceUpdate={deepUpdate}/>,
    document.getElementById('container')
  );

  Velocity(overlay, 'fadeOut', { duration: 500 });
}, 10);
