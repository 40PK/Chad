const {
  List,
  Divider,
  Dialog,
  FlatButton,
  SelectField,
  MenuItem,
  Toggle,
  Checkbox,
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

    // Binding context
    this.closePreferencesDialog = this.closePreferencesDialog.bind(this);
    this.closeAboutDialog = this.closeAboutDialog.bind(this);
    this.languageChange = this.languageChange.bind(this);
    this.darkThemeChange = this.darkThemeChange.bind(this);
    this.formattingStyleChange = this.formattingStyleChange.bind(this);
  }

  formattingStyleChange(event, index, value) {
    let data = this.props.data.postWriteDefaults;
    data.parser = value;
    this.props.signal.call('PostWriteDefaultsChange', [data]);
  }

  checkboxChange(type, event, isInputChecked) {
    let data = this.props.data.postWriteDefaults;
    data[type] = isInputChecked;
    this.props.signal.call('PostWriteDefaultsChange', [data]);
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
        onClick={this.closePreferencesDialog}
      />,
    ];

    let actionsAbout = [
      <FlatButton
        label={this.props.local.d_about_close}
        primary={true}
        onClick={this.closeAboutDialog}
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
          <h4 style={{ margin: 0 }}>{this.props.local.d_preferences_general}:</h4>
          <SelectField
            floatingLabelText={this.props.local.d_preferences_language}
            value={this.props.data.lang}
            onChange={this.languageChange}>
            <MenuItem value='en' primaryText='English' />
            <MenuItem value='ru' primaryText='Русский' />
          </SelectField>
          <Toggle
            onToggle={this.darkThemeChange}
            toggled={this.props.data.darkTheme}
            label={this.props.local.d_preferences_dark_theme} />
          
          <br/>
          <h4 style={{ margin: 0 }}>{this.props.local.d_preferences_default_postwrite}:</h4>
          <SelectField
            floatingLabelText={this.props.local.settings_formatting_styles}
            value={this.props.data.postWriteDefaults.parser}
            onChange={this.formattingStyleChange}>
            <MenuItem value='none' primaryText={this.props.local.settings_none} />
            <MenuItem value='markdown' primaryText={this.props.local.settings_markdown} />
            <MenuItem value='HTML' primaryText={this.props.local.settings_html} />
          </SelectField>
          <Checkbox
            checked={this.props.data.postWriteDefaults.disablePreview}
            value={this.props.data.postWriteDefaults.disablePreview}
            onCheck={(e, i) => this.checkboxChange('disablePreview', e, i)}
            label={this.props.local.post_settings_disable_link_preview} />
          <Checkbox
            checked={this.props.data.postWriteDefaults.disableNotification}
            value={this.props.data.postWriteDefaults.disableNotification}
            onCheck={(e, i) => this.checkboxChange('disableNotification', e, i)}
            label={this.props.local.post_settings_disable_notification} />
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
