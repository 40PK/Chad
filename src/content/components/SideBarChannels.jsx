const React = require('react');
const {
  ListItem,
  Checkbox,
  Dialog,
  FlatButton,
  TextField,
  IconButton,
  IconMenu,
  MenuItem,
} = require('material-ui');
const { grey400 } = require('material-ui/styles/colors');
const ContentAdd = require('material-ui/svg-icons/content/add').default;
const MoreVertIcon = require('material-ui/svg-icons/navigation/more-vert').default;
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  dialogStyle: { width: 310 },
};

class SideBarChannels extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newChannelDialog: false,
      newChannelName: '',
      newChannelUsername: '',
    };
    this.checkboxRefs = {};

    this.props.signal.register('SelectedChannels', () => this.selectedChannels());

    // Binding context
    this.closeNewChannelDialog = this.closeNewChannelDialog.bind(this);
    this.newChannel = this.newChannel.bind(this);
    this.openNewChannelDialog = this.openNewChannelDialog.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  openNewChannelDialog() {
    this.setState({ newChannelDialog: true });
  }

  closeNewChannelDialog() {
    this.setState({
      newChannelDialog: false,
    }, this.resetFields);
  }

  selectedChannels() {
    const checked = [];
    for (let i = 0; i < this.props.channels.length; ++i) {
      if (this.checkboxRefs[this.props.channels[i].uid].state.switched) {
        checked.push(this.props.channels[i].username);
      }
    }

    return checked;
  }

  textFieldChange(type, event) {
    const state = {};
    state[type] = event.target.value;
    this.setState(state);
  }

  resetFields() {
    this.setState({
      newChannelName: '',
      newChannelUsername: '',
    });
  }

  newChannel() {
    this.props.signal.call('NewChannel', [
      {
        name: this.state.newChannelName,
        username: this.state.newChannelUsername,
      },
    ]);
    this.closeNewChannelDialog();
  }

  removeChannel(uid) {
    this.props.signal.call('RemoveChannel', [uid, () => this.forceUpdate()]);
  }

  render() {
    const nestedItems = [];

    const actions = [
      <FlatButton
        label={this.props.local.d_add_channel_cancel}
        onClick={this.closeNewChannelDialog}
      />,
      <FlatButton
        label={this.props.local.d_add_channel_save}
        primary
        onClick={this.newChannel}
      />,
    ];

    this.props.channels.map((channel) => {
      nestedItems.push(
        <ListItem
          rightIconButton={
            <IconMenu iconButtonElement={<IconButton><MoreVertIcon color={grey400} /></IconButton>}>
              <MenuItem onClick={() => this.removeChannel(channel.uid)}>Remove</MenuItem>
            </IconMenu>
          }
          leftCheckbox={<Checkbox ref={ref => { this.checkboxRefs[channel.uid] = ref; }} />}
          key={channel.uid}
          primaryText={channel.name}
        />);
      return null;
    });

    nestedItems.push(<ListItem
      onClick={this.openNewChannelDialog}
      leftIcon={<ContentAdd />}
      key={100500}
      primaryText={this.props.local.channels_add_channel}
    />);

    return (
      <div>
        <ListItem
          primaryText={this.props.local.channels}
          primaryTogglesNestedList
          nestedItems={nestedItems}
        />
        <Dialog
          title={this.props.local.d_add_channel}
          actions={actions}
          modal
          contentStyle={tags.dialogStyle}
          open={this.state.newChannelDialog}
        >
          <TextField
            value={this.state.newChannelName}
            onChange={(e) => this.textFieldChange('newChannelName', e)}
            floatingLabelText={this.props.local.d_add_channel_name}
            hintText={this.props.local.d_add_channel_name_placeholder}
          />
          <TextField
            value={this.state.newChannelUsername}
            onChange={(e) => this.textFieldChange('newChannelUsername', e)}
            floatingLabelText={this.props.local.d_add_channel_username}
            hintText="@mychannel"
          />
        </Dialog>
      </div>
    );
  }
}
SideBarChannels.propTypes = {
  signal: React.PropTypes.object,
  channels: React.PropTypes.array,
  local: React.PropTypes.object,
};

module.exports = SideBarChannels;
