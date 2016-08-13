const {List,  Divider,  Dialog,  FlatButton,  SelectField,  MenuItem,  Toggle} = require("material-ui");

const {Layout,  Fixed,  Flex} = require("react-layout-pane");

const SideBarMenu = require("./SideBarMenu");

const SideBarChannels = require("./SideBarChannels");

const SideBarBotProfile = require("./SideBarBotProfile");

const {shell} = require("electron");

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preferencesDialog: false,
      aboutDialog: false
    };
    this.props.signal.register("MenuPreferences", (() => this.setState({
      preferencesDialog: true
    })));
    this.props.signal.register("MenuAbout", (() => this.setState({
      aboutDialog: true
    })));
  }
  openBrowser(url) {
    shell.openExternal(url);
  }
  closePreferencesDialog() {
    this.setState({
      preferencesDialog: false
    });
  }
  closeAboutDialog() {
    this.setState({
      aboutDialog: false
    });
  }
  languageChange(event, index, value) {
    this.props.signal.call("LanguageChange", [ value ]);
  }
  darkThemeChange(event) {
    this.props.signal.call("DarkThemeChange", [ event.target.checked ]);
  }
  render() {
    let BotProfileStyle = {
      height: 100,
      width: "100%"
    };
    let actionsPreferences = [ React.createElement(FlatButton, {
      label: this.props.local.d_preferences_ok,
      primary: true,
      onClick: () => this.closePreferencesDialog()
    }) ];
    let actionsAbout = [ React.createElement(FlatButton, {
      label: this.props.local.d_about_close,
      primary: true,
      onClick: () => this.closeAboutDialog()
    }) ];
    return React.createElement(Layout, {
      type: "column"
    }, React.createElement(Flex, {
      style: {
        height: "100%",
        overflow: "auto"
      }
    }, React.createElement(List, {
      style: {
        width: "100%"
      }
    }, React.createElement(SideBarMenu, {
      signal: this.props.signal,
      local: this.props.local
    }), React.createElement(Divider, null), React.createElement(SideBarChannels, {
      signal: this.props.signal,
      channels: this.props.data.channels,
      local: this.props.local
    }), React.createElement(Divider, null))), React.createElement(Fixed, null, React.createElement(SideBarBotProfile, {
      token: this.props.data.bot.token,
      avatar: this.props.data.bot.avatar,
      name: this.props.data.bot.name,
      username: this.props.data.bot.username,
      signal: this.props.signal,
      local: this.props.local
    })), React.createElement(Dialog, {
      title: this.props.local.d_preferences,
      actions: actionsPreferences,
      modal: true,
      contentStyle: {
        width: 300
      },
      open: this.state.preferencesDialog
    }, React.createElement(SelectField, {
      floatingLabelText: this.props.local.d_preferences_language,
      value: this.props.data.lang,
      onChange: (e, i, v) => this.languageChange(e, i, v)
    }, React.createElement(MenuItem, {
      value: "en",
      primaryText: "English"
    }), React.createElement(MenuItem, {
      value: "ru",
      primaryText: "Русский"
    })), React.createElement(Toggle, {
      onToggle: e => this.darkThemeChange(e),
      toggled: this.props.data.darkTheme,
      label: this.props.local.d_preferences_dark_theme
    })), React.createElement(Dialog, {
      title: this.props.local.d_about,
      actions: actionsAbout,
      modal: true,
      contentStyle: {
        width: 300
      },
      open: this.state.aboutDialog
    }, "Source code:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("https://github.com/Perkovec/Chad")
    }, "Github"), React.createElement("br", null), "Site:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("https://perkovec.github.io/Chad/")
    }, "perkovec.github.io/Chad"), React.createElement("br", null), React.createElement("br", null), "Developed by Perkovec:", React.createElement("br", null), "Telegram:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("https://telegram.me/perkovec/")
    }, "@Perkovec"), React.createElement("br", null), "VK:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("https://vk.com/id120146182")
    }, "Ilya Perkovec"), React.createElement("br", null), "E-mail:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("mailto:perkovec24@gmail.com")
    }, "perkovec24@gmail.com"), React.createElement("br", null), "LinkedIn:", React.createElement("a", {
      href: "#",
      onClick: () => this.openBrowser("https://www.linkedin.com/in/perkovec")
    }, "Ilya Perkovec")));
  }
}

module.exports = SideBar;