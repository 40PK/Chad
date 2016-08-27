const React = require('react');
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
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  topSideBarStyle: { height: '100%', overflow: 'auto' },
  listStyle: { width: '100%' },
  h4Style: { margin: 0 },
  dialogStyle: { width: 300 },
};

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

    this.openGithub = () => this.openBrowser('https://github.com/40PK/Chad');
    this.openSite = () => this.openBrowser('https://40pk.github.io/Chad/');
    this.openTelegram = () => this.openBrowser('https://telegram.me/perkovec/');
    this.openVK = () => this.openBrowser('https://vk.com/id120146182');
    this.openEmail = () => this.openBrowser('mailto:perkovec24@gmail.com');
    this.openLinkedIn = () => this.openBrowser('https://www.linkedin.com/in/perkovec');
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  formattingStyleChange(event, index, value) {
    const data = this.props.data.postWriteDefaults;
    data.parser = value;
    this.props.signal.call('PostWriteDefaultsChange', [data]);
  }

  checkboxChange(type, event, isInputChecked) {
    const data = this.props.data.postWriteDefaults;
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
    const actionsPreferences = [
      <FlatButton
        label={this.props.local.d_preferences_ok}
        primary
        onClick={this.closePreferencesDialog}
      />,
    ];

    const actionsAbout = [
      <FlatButton
        label={this.props.local.d_about_close}
        primary
        onClick={this.closeAboutDialog}
      />,
    ];

    return (
      <Layout type="column">
        <Flex style={tags.topSideBarStyle}>
          <List style={tags.listStyle}>
            <SideBarMenu
              signal={this.props.signal}
              local={this.props.local}
            />
            <Divider />
            <SideBarChannels
              signal={this.props.signal}
              channels={this.props.data.channels}
              local={this.props.local}
            />
            <Divider />
          </List>
        </Flex>
        <Fixed>
          <SideBarBotProfile
            token={this.props.data.bot.token}
            avatar={this.props.data.bot.avatar}
            name={this.props.data.bot.name}
            username={this.props.data.bot.username}
            signal={this.props.signal}
            local={this.props.local}
          />
        </Fixed>

        <Dialog
          title={this.props.local.d_preferences}
          actions={actionsPreferences}
          modal
          contentStyle={tags.dialogStyle}
          open={this.state.preferencesDialog}
        >
          <h4 style={tags.h4Style}>{this.props.local.d_preferences_general}:</h4>
          <SelectField
            floatingLabelText={this.props.local.d_preferences_language}
            value={this.props.data.lang}
            onChange={this.languageChange}
          >
            <MenuItem value="en" primaryText="English" />
            <MenuItem value="ru" primaryText="Русский" />
          </SelectField>
          <Toggle
            onToggle={this.darkThemeChange}
            toggled={this.props.data.darkTheme}
            label={this.props.local.d_preferences_dark_theme}
          />
          <br />
          <h4 style={tags.h4Style}>{this.props.local.d_preferences_default_postwrite}:</h4>
          <SelectField
            floatingLabelText={this.props.local.settings_formatting_styles}
            value={this.props.data.postWriteDefaults.parser}
            onChange={this.formattingStyleChange}
          >
            <MenuItem value="none" primaryText={this.props.local.settings_none} />
            <MenuItem value="markdown" primaryText={this.props.local.settings_markdown} />
            <MenuItem value="HTML" primaryText={this.props.local.settings_html} />
          </SelectField>
          <Checkbox
            checked={this.props.data.postWriteDefaults.disablePreview}
            value={this.props.data.postWriteDefaults.disablePreview}
            onCheck={(e, i) => this.checkboxChange('disablePreview', e, i)}
            label={this.props.local.post_settings_disable_link_preview}
          />
          <Checkbox
            checked={this.props.data.postWriteDefaults.disableNotification}
            value={this.props.data.postWriteDefaults.disableNotification}
            onCheck={(e, i) => this.checkboxChange('disableNotification', e, i)}
            label={this.props.local.post_settings_disable_notification}
          />
        </Dialog>

        <Dialog
          title={this.props.local.d_about}
          actions={actionsAbout}
          modal
          contentStyle={tags.dialogStyle}
          open={this.state.aboutDialog}
        >
          Source code: <a className="aboutLink" onClick={this.openGithub}>Github</a><br />
          Site: <a className="aboutLink" onClick={this.openSite}>perkovec.github.io/Chad</a><br />
          <br />
          Developed by Perkovec:<br />
          Telegram: <a className="aboutLink" onClick={this.openTelegram}>@Perkovec</a><br />
          VK: <a className="aboutLink" onClick={this.openVK}>Ilya Perkovec</a><br />
          E-mail: <a className="aboutLink" onClick={this.openEmail}>perkovec24@gmail.com</a><br />
          LinkedIn: <a className="aboutLink" onClick={this.openLinkedIn}>Ilya Perkovec</a>
        </Dialog>
      </Layout>
    );
  }
}
SideBar.propTypes = {
  signal: React.PropTypes.object,
  data: React.PropTypes.object,
  local: React.PropTypes.object,
};

module.exports = SideBar;
