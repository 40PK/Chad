const WPostWrite = require('./WPostWrite');
const { CircularProgress } = require('material-ui');

class ContentBarPostWrite extends React.Component {
  constructor(props) {
    super(props);

    this.wPostWriteRef = null;

    this.state = {
      sendButtonContent: this.props.local.post_send,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      sendButtonContent: nextProps.local.post_send,
    });
  }

  onSendEnd() {
    this.wPostWriteRef.clearText();
    this.setState({
      sendButtonContent: this.props.local.post_send,
    });
  }

  onSend(data) {
    data.onEnd = () => this.onSendEnd();
    data.onStart = () => this.setState({
      sendButtonContent: <CircularProgress style={{ marginTop: -8 }} size={0.4} color='#FFFFFF' />,
    });

    this.props.signal.call('SendPost', [data]);
  }

  onSaveDraft(data) {
    this.props.signal.call('SaveDraft', [data]);
  }

  render() {
    return (
      <div>
        <WPostWrite
          ref={(ref) => this.wPostWriteRef = ref}
          settings={this.props.defaults}
          sendButtonContent={this.state.sendButtonContent}
          onSend={(d) => this.onSend(d)}
          onSaveDraft={(d) => this.onSaveDraft(d)}
          local={this.props.local}/>
      </div>
    );
  }
}

module.exports = ContentBarPostWrite;
