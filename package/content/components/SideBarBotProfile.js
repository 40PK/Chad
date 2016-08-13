const {Divider,  Avatar,  ListItem,  IconButton,  IconMenu,  MenuItem,  FlatButton,  TextField,  Dialog,  CircularProgress} = require("material-ui");

const MoreVertIcon = require("material-ui/svg-icons/navigation/more-vert").default;

const RefreshIcon = require("material-ui/svg-icons/navigation/refresh").default;

const ChangeIcon = require("material-ui/svg-icons/editor/mode-edit").default;

const RemoveIcon = require("material-ui/svg-icons/action/delete").default;

class SideBarBotProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false,
      avatarLoad: false,
      setAdminBotDialog: false,
      token: this.props.token || ""
    };
    this.props.signal.register("SetLoadState", (s => this.setState({
      load: s
    })));
    this.props.signal.register("SetAvatarLoadState", (s => this.setState({
      avatarLoad: s
    })));
  }
  openSetAdminBotDialog() {
    this.setState({
      setAdminBotDialog: true
    });
  }
  closeSetAdminBotDialog() {
    this.setState({
      setAdminBotDialog: false
    });
  }
  tokenChange(event) {
    this.setState({
      token: event.target.value
    });
  }
  setAdminBot() {
    let onPass = () => {
      this.closeSetAdminBotDialog();
    };
    this.props.signal.call("SetAdminBot", [ this.state.token, onPass ]);
  }
  render() {
    let BotProfile;
    let BotAvatar = this.state.avatarLoad ? React.createElement(CircularProgress, {
      style: {
        marginTop: -5
      },
      size: .5
    }) : React.createElement(Avatar, {
      src: this.props.avatar
    });
    if (this.state.load) {
      BotProfile = React.createElement(ListItem, {
        primaryText: this.props.local.loading,
        leftAvatar: React.createElement(CircularProgress, {
          style: {
            marginTop: -5
          },
          size: .5
        })
      });
    } else if (this.props.name) {
      BotProfile = React.createElement(ListItem, {
        leftAvatar: BotAvatar,
        primaryText: React.createElement("div", {
          className: "ellipsis"
        }, this.props.name),
        secondaryText: this.props.username,
        rightIconButton: React.createElement(IconMenu, {
          iconButtonElement: React.createElement(IconButton, null, React.createElement(MoreVertIcon, null)),
          targetOrigin: {
            horizontal: "right",
            vertical: "top"
          },
          anchorOrigin: {
            horizontal: "right",
            vertical: "top"
          }
        }, React.createElement(MenuItem, {
          leftIcon: React.createElement(RefreshIcon, null),
          onClick: () => this.props.signal.call("SetAdminBot", [ this.state.token ]),
          primaryText: this.props.local.bot_refresh
        }), React.createElement(MenuItem, {
          leftIcon: React.createElement(ChangeIcon, null),
          onClick: () => this.openSetAdminBotDialog(),
          primaryText: this.props.local.bot_change
        }), React.createElement(MenuItem, {
          leftIcon: React.createElement(RemoveIcon, null),
          onClick: () => this.props.signal.call("RemoveAdminBot"),
          primaryText: this.props.local.bot_remove
        }))
      });
    } else {
      BotProfile = React.createElement(ListItem, {
        onClick: () => this.openSetAdminBotDialog(),
        leftAvatar: React.createElement(Avatar, {
          src: this.props.avatar
        }),
        primaryText: React.createElement("div", {
          className: "ellipsis"
        }, this.props.local.bot_set)
      });
    }
    let actions = [ React.createElement(FlatButton, {
      label: this.props.local.d_set_admin_bot_cancel,
      onClick: () => this.closeSetAdminBotDialog()
    }), React.createElement(FlatButton, {
      label: this.props.local.d_set_admin_bot_save,
      primary: true,
      onClick: () => this.setAdminBot()
    }) ];
    return React.createElement("div", null, React.createElement(Divider, null), BotProfile, React.createElement(Dialog, {
      title: this.props.local.d_set_admin_bot,
      actions: actions,
      modal: true,
      contentStyle: {
        width: 300
      },
      open: this.state.setAdminBotDialog
    }, React.createElement(TextField, {
      value: this.state.token,
      onChange: e => this.tokenChange(e),
      floatingLabelText: this.props.local.d_set_admin_bot_token,
      hintText: "123456:ABC-DEF1234ghIk..."
    })));
  }
}

module.exports = SideBarBotProfile;