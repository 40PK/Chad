const WPostWrite = require('./WPostWrite');
const { CircularProgress } = require('material-ui');
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  circProgressStyle: { marginTop: -8 },
};

class ContentBarPostWrite extends React.Component {
  constructor(props) {
    super(props);

    this.wPostWriteRef = null;

    this.state = {
      sendButtonContent: this.props.local.post_send,
    };

    // Binding context
    this.onSend = this.onSend.bind(this);
    this.onSaveDraft = this.onSaveDraft.bind(this);
    this.onWPostRef = this.onWPostRef.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
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
      sendButtonContent:
        <CircularProgress
          style={tags.circProgressStyle}
          size={0.4}
          color='#FFFFFF' />,
    });

    this.props.signal.call('SendPost', [data]);
  }

  onSaveDraft(data) {
    this.props.signal.call('SaveDraft', [data]);
  }

  onWPostRef(ref) {
    this.wPostWriteRef = ref;
  }

  render() {
    return (
      <div>
        <WPostWrite
          ref={this.onWPostRef}
          settings={this.props.defaults}
          sendButtonContent={this.state.sendButtonContent}
          onSend={this.onSend}
          onSaveDraft={this.onSaveDraft}
          local={this.props.local}/>
      </div>
    );
  }
}

module.exports = ContentBarPostWrite;
