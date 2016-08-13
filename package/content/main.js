const React = require("react");

const ReactDOM = require("react-dom");

const injectTapEventPlugin = require("react-tap-event-plugin");

const Chad = require("./Chad");

injectTapEventPlugin();

ReactDOM.render(React.createElement(Chad, null), document.getElementById("container"));