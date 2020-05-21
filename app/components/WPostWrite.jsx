/* eslint-disable no-alert */
const React = require('react');
const {
  SelectField,
  MenuItem,
  RaisedButton,
  FlatButton,
  Dialog,
  Checkbox,
} = require('material-ui');
const { Layout, Fixed, Flex } = require('react-layout-pane');
const shallowCompare = require('react-addons-shallow-compare');
const WPostWriteInput = require('./WPostWriteInput');
const WPostWritePreview = require('./WPostWritePreview');
const PropTypes = require('prop-types');

const tags = {
  buttonStyle: {
    margin: '8px 0 0 8px',
    float: 'right',
  },
  constentStyle: { padding: '0 8px 8px 8px' },
  settingsButtonStyle: { margin: '8px 8px 0 0' },
  previewContainerStyle: { height: 100 },
  dialogStyle: { width: 350 },
};

class WPostWrite extends React.Component {
  constructor(props) {
    super(props);

    const state = {
      parser: 'none',
      disablePreview: false,
      disableNotification: false,
      preview: '',
      settingsDialog: false,
    };

    if (this.props.settings) {
      if (this.props.settings.parser) state.parser = this.props.settings.parser;
      if (this.props.settings.disablePreview) state.disablePreview = true;
      if (this.props.settings.disableNotification) state.disableNotification = true;
    }

    this.state = state;

    this.inputRef = null;
    this.previewRef = null;

    // Binding context
    this.onSend = this.onSend.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.openSettingsDialog = this.openSettingsDialog.bind(this);
    this.closeSettingsDialog = this.closeSettingsDialog.bind(this);
    this.formattingStyleChange = this.formattingStyleChange.bind(this);
    this.checkParser = this.checkParser.bind(this);
    this.onInputRef = this.onInputRef.bind(this);
    this.onPreviewRef = this.onPreviewRef.bind(this);
    this.updatePreview = this.updatePreview.bind(this);
    this.getParser = this.getParser.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const state = this.state;
    if (newProps.settings) {
      if (newProps.settings.parser) state.parser = newProps.settings.parser;
      if (newProps.settings.disablePreview) state.disablePreview = true;
      if (newProps.settings.disableNotification) state.disableNotification = true;
    }

    this.setState(state, () => this.updatePreview(this.inputRef.getText()));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  onSend() {
    this.props.onSend({
      text: this.inputRef.getText(),
      parser: this.state.parser,
      disablePreview: this.state.disablePreview,
      disableNotification: this.state.disableNotification,
    });
  }

  onInputRef(ref) {
    this.inputRef = ref;
  }

  onPreviewRef(ref) {
    this.previewRef = ref;
  }

  getParser() {
    return this.state.parser;
  }

  clearText() {
    this.inputRef.clearText();
  }

  saveDraft() {
    this.props.onSaveDraft({
      text: this.inputRef.getText(),
      parser: this.state.parser,
      disablePreview: this.state.disablePreview,
      disableNotification: this.state.disableNotification,
    });
  }

  checkboxChange(type, event, isInputChecked) {
    const state = {};
    state[type] = isInputChecked;
    this.setState(state);
  }

  updatePreview(text) {
    this.previewRef.updatePreview(text, this.state.parser);
  }

  formattingStyleChange(event, index, value) {
    this.setState({
      parser: value,
    }, () => this.updatePreview(this.inputRef.getText()));
  }

  fieldChange(event, type) {
    const state = {};
    state[type] = event.target.value;
    this.setState(state);
  }

  closeSettingsDialog() {
    this.setState({ settingsDialog: false });
  }

  openSettingsDialog() {
    this.setState({ settingsDialog: true });
  }

  checkParser() {
    if (this.state.parser === 'none') {
      return alert(this.props.local.alert_select_formatting_style);
    }

    return true;
  }

  render() {
    const settingsActions = [
      <FlatButton
        label={this.props.local.post_settings_ok}
        primary
        onClick={this.closeSettingsDialog}
      />,
    ];

    let sendButton;
    if (typeof this.props.sendButtonContent === 'string') {
      sendButton = (<RaisedButton
        label={this.props.sendButtonContent}
        style={tags.buttonStyle}
        primary
        onClick={this.onSend}
      />);
    } else {
      sendButton = (<RaisedButton
        icon={this.props.sendButtonContent}
        style={tags.buttonStyle}
        primary
        onClick={this.onSend}
      />);
    }

    return (
      <Layout type="column" style={tags.constentStyle}>
        <Fixed>
          <WPostWriteInput
            ref={this.onInputRef}
            text={this.props.text}
            updatePreview={this.updatePreview}
            checkParser={this.checkParser}
            getParser={this.getParser}
            local={this.props.local}
          />
        </Fixed>
        <Flex>
          <Layout type="column">
            <Flex style={tags.previewContainerStyle}>
              <WPostWritePreview
                ref={this.onPreviewRef}
                parser={this.state.parser}
                text={this.props.text || ''}
                local={this.props.local}
              />
            </Flex>
            <Fixed>
              {sendButton}
              <RaisedButton
                label={this.props.local.post_save_draft}
                style={tags.buttonStyle}
                onClick={this.saveDraft}
              />
              {this.props.onCancel && (
                <RaisedButton
                  label={this.props.local.post_cancel}
                  style={tags.buttonStyle}
                  onClick={this.props.onCancel}
                />
              )}
              <RaisedButton
                label={this.props.local.settings}
                style={tags.settingsButtonStyle}
                onClick={this.openSettingsDialog}
              />

              <Dialog
                title={this.props.local.post_settings}
                actions={settingsActions}
                modal
                contentStyle={tags.dialogStyle}
                open={this.state.settingsDialog}
              >
                <SelectField
                  floatingLabelText={this.props.local.settings_formatting_styles}
                  value={this.state.parser}
                  onChange={this.formattingStyleChange}
                >
                  <MenuItem value="none" primaryText={this.props.local.settings_none} />
                  <MenuItem value="markdown" primaryText={this.props.local.settings_markdown} />
                  <MenuItem value="HTML" primaryText={this.props.local.settings_html} />
                </SelectField>
                <Checkbox
                  checked={this.state.disablePreview}
                  value={this.state.disablePreview}
                  onCheck={(e, i) => this.checkboxChange('disablePreview', e, i)}
                  label={this.props.local.post_settings_disable_link_preview}
                />
                <Checkbox
                  checked={this.state.disableNotification}
                  value={this.state.disableNotification}
                  onCheck={(e, i) => this.checkboxChange('disableNotification', e, i)}
                  label={this.props.local.post_settings_disable_notification}
                />
              </Dialog>
            </Fixed>
          </Layout>
        </Flex>
      </Layout>
    );
  }
}
WPostWrite.propTypes = {
  settings: PropTypes.object,
  local: PropTypes.object,
  text: PropTypes.string,
  sendButtonContent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  onSend: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onCancel: PropTypes.func,
};

module.exports = WPostWrite;
