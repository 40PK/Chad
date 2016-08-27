const React = require('react');
const {
  Divider,
  Avatar,
  ListItem,
  IconButton,
  IconMenu,
  MenuItem,
  FlatButton,
  TextField,
  Dialog,
  CircularProgress,
} = require('material-ui');
const MoreVertIcon = require('material-ui/svg-icons/navigation/more-vert').default;
const RefreshIcon = require('material-ui/svg-icons/navigation/refresh').default;
const ChangeIcon = require('material-ui/svg-icons/editor/mode-edit').default;
const RemoveIcon = require('material-ui/svg-icons/action/delete').default;
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  circProgressStyle: { marginTop: -5 },
  origin: { horizontal: 'right', vertical: 'top' },
  dialogStyle: { width: 300 },
};

class SideBarBotProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      load: false,
      avatarLoad: false,
      setAdminBotDialog: false,
      token: this.props.token || '',
    };

    this.props.signal.register('SetLoadState', (s) => this.setState({ load: s }));
    this.props.signal.register('SetAvatarLoadState', (s) => this.setState({ avatarLoad: s }));

    // Binding context
    this.setAdminBot = this.setAdminBot.bind(this);
    this.openSetAdminBotDialog = this.openSetAdminBotDialog.bind(this);
    this.closeSetAdminBotDialog = this.closeSetAdminBotDialog.bind(this);
    this.removeAdminBot = this.removeAdminBot.bind(this);
    this.tokenChange = this.tokenChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  setAdminBot() {
    this.props.signal.call('SetAdminBot', [this.state.token, this.closeSetAdminBotDialog]);
  }

  removeAdminBot() {
    this.props.signal.call('RemoveAdminBot');
  }

  openSetAdminBotDialog() {
    this.setState({ setAdminBotDialog: true });
  }

  closeSetAdminBotDialog() {
    this.setState({ setAdminBotDialog: false });
  }

  tokenChange(event) {
    this.setState({ token: event.target.value });
  }

  render() {
    let BotProfile;

    const BotAvatar = this.state.avatarLoad ?
      (<CircularProgress style={tags.circProgressStyle} size={0.5} />) :
      (<Avatar src={this.props.avatar} />);

    if (this.state.load) {
      BotProfile = (<ListItem
        primaryText={this.props.local.loading}
        leftAvatar={<CircularProgress style={tags.circProgressStyle} size={0.5} />}
      />);
    } else if (this.props.name) {
      BotProfile = (
        <ListItem
          leftAvatar={BotAvatar}
          primaryText={<div className="ellipsis">{this.props.name}</div>}
          secondaryText={this.props.username}
          rightIconButton={
            <IconMenu
              iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
              targetOrigin={tags.origin}
              anchorOrigin={tags.origin}
            >
              <MenuItem
                leftIcon={<RefreshIcon />}
                onClick={this.setAdminBot}
                primaryText={this.props.local.bot_refresh}
              />
              <MenuItem
                leftIcon={<ChangeIcon />}
                onClick={this.openSetAdminBotDialog}
                primaryText={this.props.local.bot_change}
              />
              <MenuItem
                leftIcon={<RemoveIcon />}
                onClick={this.removeAdminBot}
                primaryText={this.props.local.bot_remove}
              />
            </IconMenu>
          }
        />);
    } else {
      BotProfile = (
        <ListItem
          onClick={this.openSetAdminBotDialog}
          leftAvatar={<Avatar src={this.props.avatar} />}
          primaryText={<div className="ellipsis">{this.props.local.bot_set}</div>}
        />);
    }

    const actions = [
      <FlatButton
        label={this.props.local.d_set_admin_bot_cancel}
        onClick={this.closeSetAdminBotDialog}
      />,
      <FlatButton
        label={this.props.local.d_set_admin_bot_save}
        primary
        onClick={this.setAdminBot}
      />,
    ];

    return (
      <div>
        <Divider />
        {BotProfile}
        <Dialog
          title={this.props.local.d_set_admin_bot}
          actions={actions}
          modal
          contentStyle={tags.dialogStyle}
          open={this.state.setAdminBotDialog}
        >
          <TextField
            value={this.state.token}
            onChange={this.tokenChange}
            floatingLabelText={this.props.local.d_set_admin_bot_token}
            hintText="123456:ABC-DEF1234ghIk..."
          />
        </Dialog>
      </div>
    );
  }
}
SideBarBotProfile.propTypes = {
  token: React.PropTypes.string,
  avatar: React.PropTypes.string,
  name: React.PropTypes.string,
  username: React.PropTypes.string,
  local: React.PropTypes.object,
  signal: React.PropTypes.object,
};

module.exports = SideBarBotProfile;
