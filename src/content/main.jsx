const overlay = document.getElementById('overlay');
let instance = null;

setTimeout(() => {
  /* eslint-disable global-require */
  const React = require('react');
  const { render } = require('react-dom');
  const injectTapEventPlugin = require('react-tap-event-plugin');
  const deepForceUpdate = require('react-deep-force-update');
  const velocity = require('velocity-animate');
  require('./js/DataRepair')();
  /* eslint-enable global-require */

  injectTapEventPlugin();

  function deepUpdate() {
    deepForceUpdate(instance);
  }

  /* eslint-disable global-require */
  const Chad = require('./Chad');
  /* eslint-enable global-require */

  instance = render(
    <Chad deepForceUpdate={deepUpdate} />,
    document.getElementById('container')
  );

  velocity(overlay, 'fadeOut', { duration: 500 });
}, 10);
