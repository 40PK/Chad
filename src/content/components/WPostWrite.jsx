const {
  SelectField,
  MenuItem,
  RaisedButton,
  TextField,
  Paper,
  Subheader,
  Divider,
  FlatButton,
  Dialog,
  Checkbox,
} = require('material-ui');
const { Layout, Fixed, Flex } = require('react-layout-pane');
const parser = require('../js/parser');

const buttonStyle = {
  margin: '8px 0 0 8px',
  float: 'right',
};

const constrolButtonStyle = {
  margin: '8px 0 0 8px',
};

const previewStyle = {
  width: '100%',
  height: '100%',
};

class WPostWrite extends React.Component {
  constructor(props) {
    super(props);

    let state = {
      parser: 'none',
      postText: this.props.text || '',
      disablePreview: false,
      disableNotification: false,
      preview: '',
      settingsDialog: false,
      insertLinkDialog: false,
      insertLinkTitle: '',
      insertLinkURL: '',
    };
    state.preview = parser({
      data: state.postText,
      mode: state.parser,
    });

    if (this.props.settings) {
      if (this.props.settings.parser) state.parser = this.props.settings.parser;
      if (this.props.settings.disablePreview) state.disablePreview = true;
      if (this.props.settings.disableNotification) state.disableNotification = true;
    }

    this.state = state;

    this.inputRef = null;
  }

  checkParser() {
    if (this.state.parser === 'none')
      return alert('Select formatting style.');

    return true;
  }

  // DIALOGS - START

  openInsertLinkDialog() {
    this.setState({ insertLinkDialog: true });
  }

  closeInsertLinkDialog() {
    this.setState({ insertLinkDialog: false });
  }

  openSettingsDialog() {
    this.setState({ settingsDialog: true });
  }

  closeSettingsDialog() {
    this.setState({ settingsDialog: false });
  }

  // DIALOGS - END

  fieldChange(event, type) {
    let state = {};
    state[type] = event.target.value;
    this.setState(state);
  }

  replaceText(start, end, text) {
    let postText = this.state.postText;
    this.setState({
      postText: postText.substring(0, start) +
                text + postText.substring(end, postText.length),
    }, this.updatePreview);
  }

  insertLink() {
    if (!this.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let title = (selStart === selEnd) ? this.state.postText.substring(selStart, selEnd) : '';
    let state = this.state;

    this.setState({
      insertLinkTitle: title,
      insertLinkURL: '',
    }, this.openInsertLinkDialog);
  }

  insertLinkInText() {
    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let res;
    if (this.state.parser === 'markdown')  {
      res = `[${this.state.insertLinkTitle}](${this.state.insertLinkURL})`;
    } else if (this.state.parser === 'HTML') {
      res = `<a href="${this.state.insertLinkURL}">${this.state.insertLinkTitle}</a>`;
    }

    this.replaceText(selStart, selEnd, res);
    this.closeInsertLinkDialog();
  }

  insertBold() {
    if (!this.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let state = this.state;
    let text = this.state.postText.substring(selStart, selEnd);
    if (text.length === 0) text = 'bold';

    let res;
    if (this.state.parser === 'markdown')  {
      res = `*${text}*`;
    } else if (this.state.parser === 'HTML') {
      res = `<b>${text}</b>`;
    }

    this.replaceText(selStart, selEnd, res);
  }

  insertItalic() {
    if (!this.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let state = this.state;
    let text = this.state.postText.substring(selStart, selEnd);
    if (text.length === 0) text = 'italic';

    let res;
    if (this.state.parser === 'markdown')  {
      res = `_${text}_`;
    } else if (this.state.parser === 'HTML') {
      res = `<i>${text}</i>`;
    }

    this.replaceText(selStart, selEnd, res);
  }

  onInputRef(ref) {
    if (this.inputRef === null) this.inputRef = ref.input.refs.input;
  }

  formattingStyleChange(event, index, value) {
    this.setState({
      parser: value,
    }, this.updatePreview);
  }

  postTextChange(event) {
    this.setState({
      postText: event.target.value,
    }, this.updatePreview);
  }

  clearText() {
    this.setState({
      postText: '',
    }, this.updatePreview);
  }

  updatePreview() {
    this.setState({
      preview: parser({
        data: this.state.postText,
        mode: this.state.parser,
      }),
    });
  }

  checkboxChange(type, event, isInputChecked) {
    let state = {};
    state[type] = isInputChecked;
    this.setState(state);
  }

  onSend() {
    this.props.onSend({
      text: this.state.postText,
      parser: this.state.parser,
      disablePreview: this.state.disablePreview,
      disableNotification: this.state.disableNotification,
    });
  }

  saveDraft() {
    this.props.onSaveDraft({
      text: this.state.postText,
      parser: this.state.parser,
      disablePreview: this.state.disablePreview,
      disableNotification: this.state.disableNotification,
    });
  }

  render() {
    let settingsActions = [
      <FlatButton
        label={this.props.local.post_settings_ok}
        primary={true}
        onClick={() => this.closeSettingsDialog()}
      />,
    ];

    let linkActions = [
      <FlatButton
        label={this.props.local.d_insert_link_cancel}
        primary={true}
        onClick={() => this.closeInsertLinkDialog()}
      />,
      <FlatButton
        label={this.props.local.d_insert_link_save}
        primary={true}
        onClick={() => this.insertLinkInText()}
      />,
    ];

    let sendButton;
    if (typeof this.props.sendButtonContent === 'string') {
      sendButton = <RaisedButton
                    label={this.props.sendButtonContent}
                    style={buttonStyle}
                    primary={true}
                    onClick={() => this.onSend()}/>;
    } else {
      sendButton = <RaisedButton
                    icon={this.props.sendButtonContent}
                    style={buttonStyle}
                    primary={true}
                    onClick={() => this.onSend()}/>;
    }

    return (
      <Layout type='column' style={{ padding: '0 8px 8px 8px' }}>
        <Fixed>
          <RaisedButton
            onClick={() => this.insertLink()}
            label={this.props.local.settings_link}
            style={constrolButtonStyle} />
          <RaisedButton
            onClick={() => this.insertBold()}
            label={this.props.local.settings_bold}
            style={constrolButtonStyle} />
          <RaisedButton
            onClick={() => this.insertItalic()}
            label={this.props.local.settings_italic}
            style={constrolButtonStyle} />
          <Divider style={{ marginTop: 10 }} />
          
          <TextField
            ref={(ref) => this.onInputRef(ref)}
            onChange={(e) => this.postTextChange(e)}
            value={this.state.postText}
            multiLine={true}
            rowsMax={11}
            hintText={this.props.local.post_test}
            fullWidth={true} />
        </Fixed>
        <Flex>
          <Layout type='column'>
            <Flex style={{ height: 100 }}>
              <Paper style={previewStyle} zDepth={1} rounded={false}>
                <Layout type='column'>
                  <Fixed>
                    <Subheader>{this.props.local.preview}</Subheader>
                    <Divider />
                  </Fixed>
                  <Flex style={{ height: 100 }}>
                    <div className='preview-overflow'>
                      <pre
                        dangerouslySetInnerHTML={{ __html: this.state.preview }}
                        className='preview'></pre>
                    </div>
                  </Flex>
                </Layout>
              </Paper>
            </Flex>
            <Fixed>
              {sendButton}
              <RaisedButton label={this.props.local.post_save_draft}
                style={buttonStyle}
                onClick={() => this.saveDraft()}/>
              {this.props.onCancel && (
                <RaisedButton label={this.props.local.post_cancel}
                  style={buttonStyle}
                  onClick={this.props.onCancel}/>
              )}
              <RaisedButton label={this.props.local.settings}
                style={{ margin: '8px 8px 0 0' }}
                onClick={() => this.openSettingsDialog()}/>

              <Dialog
                title={this.props.local.post_settings}
                actions={settingsActions}
                modal={true}
                contentStyle={{ width: 350 }}
                open={this.state.settingsDialog}>
                <SelectField
                  floatingLabelText={this.props.local.settings_formatting_styles}
                  value={this.state.parser}
                  onChange={(e, i, v) => this.formattingStyleChange(e, i, v)}>
                  <MenuItem value='none' primaryText={this.props.local.settings_none} />
                  <MenuItem value='markdown' primaryText={this.props.local.settings_markdown} />
                  <MenuItem value='HTML' primaryText={this.props.local.settings_html} />
                </SelectField>
                <Checkbox
                  checked={this.state.disablePreview}
                  value={this.state.disablePreview}
                  onCheck={(e, i) => this.checkboxChange('disablePreview', e, i)}
                  label={this.props.local.post_settings_disable_link_preview} />
                <Checkbox
                  checked={this.state.disableNotification}
                  value={this.state.disableNotification}
                  onCheck={(e, i) => this.checkboxChange('disableNotification', e, i)}
                  label={this.props.local.post_settings_disable_notification} />
              </Dialog>

              <Dialog
                title={this.props.local.d_insert_link}
                actions={linkActions}
                modal={true}
                contentStyle={{ width: 350 }}
                open={this.state.insertLinkDialog}>
                <TextField
                  value={this.state.insertLinkTitle}
                  onChange={(e) => this.fieldChange(e, 'insertLinkTitle')}
                  floatingLabelText={this.props.local.d_insert_link_title}/>
                <TextField
                  value={this.state.insertLinkURL}
                  onChange={(e) => this.fieldChange(e, 'insertLinkURL')}
                  floatingLabelText={this.props.local.d_insert_link_url}/>
              </Dialog>
            </Fixed>
          </Layout>
        </Flex>
      </Layout>
    );
  }
}

module.exports = WPostWrite;
