const {ListItem,  Checkbox,  Dialog,  FlatButton,  TextField,  IconButton,  IconMenu,  MenuItem} = require("material-ui");

const {grey400} = require("material-ui/styles/colors");

const ContentAdd = require("material-ui/svg-icons/content/add").default;

const MoreVertIcon = require("material-ui/svg-icons/navigation/more-vert").default;

class SideBarChannels extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newChannelDialog: false,
      newChannelName: "",
      newChannelUsername: ""
    };
    this.checkboxRefs = {};
    this.props.signal.register("SelectedChannels", (() => this.selectedChannels()));
  }
  openNewChannelDialog() {
    this.setState({
      newChannelDialog: true
    });
  }
  closeNewChannelDialog() {
    this.setState({
      newChannelDialog: false
    }, this.resetFields);
  }
  selectedChannels() {
    let checked = [];
    for (let i = 0; i < this.props.channels.length; ++i) {
      if (this.checkboxRefs[this.props.channels[i].uid].state.switched) {
        checked.push(this.props.channels[i].username);
      }
    }
    return checked;
  }
  textFieldChange(type, event) {
    let state = {};
    state[type] = event.target.value;
    this.setState(state);
  }
  resetFields() {
    this.setState({
      newChannelName: "",
      newChannelUsername: ""
    });
  }
  newChannel() {
    this.props.signal.call("NewChannel", [ {
      name: this.state.newChannelName,
      username: this.state.newChannelUsername
    } ]);
    this.closeNewChannelDialog();
  }
  removeChannel(uid) {
    this.props.signal.call("RemoveChannel", [ uid ]);
  }
  render() {
    let nestedItems = [];
    let actions = [ React.createElement(FlatButton, {
      label: this.props.local.d_add_channel_cancel,
      onClick: () => this.closeNewChannelDialog()
    }), React.createElement(FlatButton, {
      label: this.props.local.d_add_channel_save,
      primary: true,
      onClick: () => this.newChannel()
    }) ];
    this.props.channels.map((channel => {
      nestedItems.push(React.createElement(ListItem, {
        rightIconButton: React.createElement(IconMenu, {
          iconButtonElement: React.createElement(IconButton, null, React.createElement(MoreVertIcon, {
            color: grey400
          }))
        }, React.createElement(MenuItem, {
          onClick: () => this.removeChannel(channel.uid)
        }, "Remove")),
        leftCheckbox: React.createElement(Checkbox, {
          ref: ref => this.checkboxRefs[channel.uid] = ref
        }),
        key: channel.uid,
        primaryText: channel.name
      }));
    }));
    nestedItems.push(React.createElement(ListItem, {
      onClick: () => this.openNewChannelDialog(),
      leftIcon: React.createElement(ContentAdd, null),
      key: 100500,
      primaryText: this.props.local.channels_add_channel
    }));
    return React.createElement("div", null, React.createElement(ListItem, {
      primaryText: this.props.local.channels,
      primaryTogglesNestedList: true,
      nestedItems: nestedItems
    }), React.createElement(Dialog, {
      title: this.props.local.d_add_channel,
      actions: actions,
      modal: true,
      contentStyle: {
        width: 300
      },
      open: this.state.newChannelDialog
    }, React.createElement(TextField, {
      value: this.state.newChannelName,
      onChange: e => this.textFieldChange("newChannelName", e),
      floatingLabelText: this.props.local.d_add_channel_name,
      hintText: this.props.local.d_add_channel_name_placeholder
    }), React.createElement(TextField, {
      value: this.state.newChannelUsername,
      onChange: e => this.textFieldChange("newChannelUsername", e),
      floatingLabelText: this.props.local.d_add_channel_username,
      hintText: "@mychannel"
    })));
  }
}

module.exports = SideBarChannels;