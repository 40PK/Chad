const {
  RaisedButton,
  TextField,
  Divider,
  FlatButton,
  Dialog,
} = require('material-ui');
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  buttonStyle: {
    margin: '8px 0 0 8px',
    float: 'right',
  },
  constrolButtonStyle: { margin: '8px 0 0 8px' },
  dialogStyle: { width: 350 },
  dividerStyle: { marginTop: 10 },
};

class WPostWriteInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: this.props.text || '',
      insertLinkTitle: '',
      insertLinkURL: '',
      insertLinkDialog: false,
    };

    this.inputRef = null;

    // Binding context
    this.insertLink = this.insertLink.bind(this);
    this.insertBold = this.insertBold.bind(this);
    this.insertItalic = this.insertItalic.bind(this);
    this.onInputRef = this.onInputRef.bind(this);
    this.postTextChange = this.postTextChange.bind(this);
    this.titleFieldChange = this.titleFieldChange.bind(this);
    this.urlFieldChange = this.urlFieldChange.bind(this);
    this.closeInsertLinkDialog = this.closeInsertLinkDialog.bind(this);
    this.insertLinkInText = this.insertLinkInText.bind(this);
    this.clearText = this.clearText.bind(this);
    this.getText = this.getText.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  openInsertLinkDialog() {
    this.setState({ insertLinkDialog: true });
  }

  closeInsertLinkDialog() {
    this.setState({ insertLinkDialog: false });
  }

  replaceText(start, end, text) {
    let postText = this.state.text;
    this.setState({
      text: postText.substring(0, start) +
            text + postText.substring(end, postText.length),
    }, () => {
      this.props.updatePreview(this.state.text);
      this.inputRef.focus();
      this.inputRef.setSelectionRange(start + text.length, start + text.length);
    });
  }

  insertLink() {
    if (!this.props.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let title = (selStart === selEnd) ? '' : this.state.text.substring(selStart, selEnd);
    let state = this.state;

    this.setState({
      insertLinkTitle: title,
      insertLinkURL: '',
    }, this.openInsertLinkDialog);
  }

  insertLinkInText() {
    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let parser = this.props.getParser();

    let res;
    if (parser === 'markdown')  {
      res = `[${this.state.insertLinkTitle}](${this.state.insertLinkURL})`;
    } else if (parser === 'HTML') {
      res = `<a href="${this.state.insertLinkURL}">${this.state.insertLinkTitle}</a>`;
    }

    this.replaceText(selStart, selEnd, res);
    this.closeInsertLinkDialog();
  }

  insertBold() {
    if (!this.props.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let state = this.state;
    let text = this.state.text.substring(selStart, selEnd);
    if (text.length === 0) text = 'bold';

    let parser = this.props.getParser();

    let res;
    if (parser === 'markdown')  {
      res = `*${text}*`;
    } else if (parser === 'HTML') {
      res = `<b>${text}</b>`;
    }

    this.replaceText(selStart, selEnd, res);
  }

  insertItalic() {
    if (!this.props.checkParser()) return;

    let selStart = this.inputRef.selectionStart;
    let selEnd = this.inputRef.selectionEnd;

    let state = this.state;
    let text = this.state.text.substring(selStart, selEnd);
    if (text.length === 0) text = 'italic';

    let parser = this.props.getParser();

    let res;
    if (parser === 'markdown')  {
      res = `_${text}_`;
    } else if (parser === 'HTML') {
      res = `<i>${text}</i>`;
    }

    this.replaceText(selStart, selEnd, res);
  }

  onInputRef(ref) {
    if (this.inputRef === null) this.inputRef = ref.input.refs.input;
  }

  clearText() {
    this.setState({
      text: '',
    }, () => this.props.updatePreview(''));
  }

  getText() {
    return this.state.text;
  }

  postTextChange(event) {
    this.setState({
      text: event.target.value,
    }, () => this.props.updatePreview(this.state.text));
  }

  titleFieldChange(event) {
    this.setState({ insertLinkTitle: event.target.value });
  }

  urlFieldChange(event) {
    this.setState({ insertLinkURL: event.target.value });
  }

  render() {
    let linkActions = [
      <FlatButton
        label={this.props.local.d_insert_link_cancel}
        primary={true}
        onClick={this.closeInsertLinkDialog}
      />,
      <FlatButton
        label={this.props.local.d_insert_link_save}
        primary={true}
        onClick={this.insertLinkInText}
      />,
    ];

    return (
      <div>
        <RaisedButton
          onClick={this.insertLink}
          label={this.props.local.settings_link}
          style={tags.constrolButtonStyle} />
        <RaisedButton
          onClick={this.insertBold}
          label={this.props.local.settings_bold}
          style={tags.constrolButtonStyle} />
        <RaisedButton
          onClick={this.insertItalic}
          label={this.props.local.settings_italic}
          style={tags.constrolButtonStyle} />
        <Divider style={tags.dividerStyle} />
          
        <TextField
          ref={this.onInputRef}
          onChange={this.postTextChange}
          multiLine={true}
          value={this.state.text}
          rowsMax={11}
          hintText={this.props.local.post_test}
          fullWidth={true} />

        <Dialog
          title={this.props.local.d_insert_link}
          actions={linkActions}
          modal={true}
          contentStyle={tags.dialogStyle}
          open={this.state.insertLinkDialog}>
          <TextField
            value={this.state.insertLinkTitle}
            onChange={this.titleFieldChange}
            floatingLabelText={this.props.local.d_insert_link_title}/>
          <TextField
            value={this.state.insertLinkURL}
            onChange={this.urlFieldChange}
            floatingLabelText={this.props.local.d_insert_link_url}/>
        </Dialog>
      </div>
    );
  }
}

module.exports = WPostWriteInput;
