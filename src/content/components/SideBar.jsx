const {
  List,
  Divider,
  Dialog,
  FlatButton,
  SelectField,
  MenuItem,
  Toggle,
} = require('material-ui');
const { Layout, Fixed, Flex } = require('react-layout-pane');
const SideBarMenu = require('./SideBarMenu');
const SideBarChannels = require('./SideBarChannels');
const SideBarBotProfile = require('./SideBarBotProfile');
const { shell } = require('electron');

class SideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preferencesDialog: false,
      aboutDialog: false,
    };

    this.props.signal.register('MenuPreferences', () => this.setState({ preferencesDialog: true }));
    this.props.signal.register('MenuAbout', () => this.setState({ aboutDialog: true }));
  }

  openBrowser(url) {
    shell.openExternal(url);
  }

  closePreferencesDialog() {
    this.setState({ preferencesDialog: false });
  }

  closeAboutDialog() {
    this.setState({ aboutDialog: false });
  }

  languageChange(event, index, value) {
    this.props.signal.call('LanguageChange', [value]);
  }

  darkThemeChange(event) {
    this.props.signal.call('DarkThemeChange', [event.target.checked]);
  }

  render() {
    let BotProfileStyle = { height: 100, width: '100%' };

    let actionsPreferences = [
      <FlatButton
        label={this.props.local.d_preferences_ok}
        primary={true}
        onClick={() => this.closePreferencesDialog()}
      />,
    ];

    let actionsAbout = [
      <FlatButton
        label={this.props.local.d_about_close}
        primary={true}
        onClick={() => this.closeAboutDialog()}
      />,
    ];

    return (
      <Layout type='column'>
        <Flex style={{ height: '100%', overflow: 'auto' }}>
          <List style={{ width: '100%' }}>
            <SideBarMenu
              signal={this.props.signal}
              local={this.props.local}/>
            <Divider/>
            <SideBarChannels
              signal={this.props.signal}
              channels={this.props.data.channels}
              local={this.props.local}/>
            <Divider/>
          </List>
        </Flex>
        <Fixed>
          <SideBarBotProfile
            token={this.props.data.bot.token}
            avatar={this.props.data.bot.avatar}
            name={this.props.data.bot.name}
            username={this.props.data.bot.username}
            signal={this.props.signal}
            local={this.props.local}/>
        </Fixed>
        <Dialog
          title={this.props.local.d_preferences}
          actions={actionsPreferences}
          modal={true}
          contentStyle={{ width: 300 }}
          open={this.state.preferencesDialog}>
          <SelectField
            floatingLabelText={this.props.local.d_preferences_language}
            value={this.props.data.lang}
            onChange={(e, i, v) => this.languageChange(e, i, v)}>
            <MenuItem value='en' primaryText='English' />
            <MenuItem value='ru' primaryText='Русский' />
          </SelectField>
          <Toggle
            onToggle={(e) => this.darkThemeChange(e)}
            toggled={this.props.data.darkTheme}
            label={this.props.local.d_preferences_dark_theme} />
        </Dialog>
        <Dialog
          title={this.props.local.d_about}
          actions={actionsAbout}
          modal={true}
          contentStyle={{ width: 300 }}
          open={this.state.aboutDialog}>
          Source code: 
            <a href="#" onClick={() => this.openBrowser('https://github.com/Perkovec/Chad')}>
              Github
            </a><br/>
          Site: 
            <a href="#" onClick={() => this.openBrowser('https://perkovec.github.io/Chad/')}>
              perkovec.github.io/Chad
            </a><br/>
          <br/>
          Developed by Perkovec:<br/>
          Telegram: 
            <a href="#" onClick={() => this.openBrowser('https://telegram.me/perkovec/')}>
              @Perkovec
            </a><br/>
          VK: 
            <a href="#" onClick={() => this.openBrowser('https://vk.com/id120146182')}>
              Ilya Perkovec
            </a><br/>
          E-mail: 
            <a href="#" onClick={() => this.openBrowser('mailto:perkovec24@gmail.com')}>
              perkovec24@gmail.com
            </a><br/>
          LinkedIn: 
            <a href="#" onClick={() => this.openBrowser('https://www.linkedin.com/in/perkovec')}>
              Ilya Perkovec
            </a>
        </Dialog>
      </Layout>
    );
  }
}

module.exports = SideBar;
