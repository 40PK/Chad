const {
  Card,
  CardText,
  CardActions,
  FlatButton,
  CircularProgress,
} = require('material-ui');
const { grey300 } = require('material-ui/styles/colors');
const EmptyIcon = require('material-ui/svg-icons/action/assignment-late').default;
const WPostWrite = require('./WPostWrite');
const parser = require('../js/parser');
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  circProgressStyle: { marginTop: -8 },
  cardStyle: { marginTop: 8 },
  contentStyle: { padding: '0px 8px 8px 8px' },
};

class ContentBarDraft extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      change: null,
      sending: null,
      sendButtonContent: this.props.local.drafts_send,
    };

    this.props.signal.register('PostDraftBtn', (v) => this.setState({ sendButtonContent: v }));

    // Binding context
    this.changeDraft = this.changeDraft.bind(this);
    this.cancelEditDraft = this.cancelEditDraft.bind(this);
    this.sendDraft = this.sendDraft.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  cancelEditDraft() {
    this.setState({
      change: null,
    });
  }

  deleteDraft(uid) {
    this.props.signal.call('DeleteDraft', [uid]);
  }

  editDraft(uid) {
    this.setState({
      change: uid,
    });
  }

  onSendDraftEnd(uid) {
    this.setState({
      change: null,
      sending: null,
      sendButtonContent: this.props.local.post_send,
    });
    this.deleteDraft(uid);
  }

  sendDraft(data) {
    let uid = this.state.change;
    data.onEnd = () => this.onSendDraftEnd(uid);
    data.onStart = () => this.setState({
      sendButtonContent:
        <CircularProgress
          style={tags.circProgressStyle}
          size={0.4}
          color='#FFFFFF' />,
    });

    this.props.signal.call('SendPost', [data]);
  }

  sendDraftByUid(uid) {
    let data = this.getDraftByUid(uid);
    data.onEnd = () => this.onSendDraftEnd(uid);
    data.onStart = () => this.setState({
      sending: uid,
    });

    this.props.signal.call('SendPost', [data]);
  }

  changeDraft(data) {
    data.uid = this.state.change;

    this.props.signal.call('ChangeDraft', [data]);
    this.setState({
      change: null,
    });
  }

  getDraftByUid(uid) {
    for (let i = 0; i < this.props.drafts.length; ++i) {
      if (this.props.drafts[i].uid === uid) return this.props.drafts[i];
    }
  }

  render() {
    let content;

    if (this.state.change === null) {
      if (this.props.drafts.length > 0) {
        content = [];
        this.props.drafts.map((draft) => {
          let html = parser({
            mode: draft.parse_mode,
            data: draft.text,
          });
          let sendButtonContent = this.state.sending === draft.uid ?
            (<FlatButton
              onClick={() => this.sendDraftByUid(draft.uid)}
              primary={true}
              icon={<CircularProgress style={tags.circProgressStyle} size={0.4} />} />) :
            (<FlatButton
              onClick={() => this.sendDraftByUid(draft.uid)}
              primary={true}
              label={this.props.local.drafts_send} />);

          content.push(
            <Card key={draft.uid} style={tags.cardStyle}>
              <CardText>
                <pre dangerouslySetInnerHTML={{ __html: html }} className='preview'></pre>
              </CardText>
              <CardActions>
                <FlatButton
                  onClick={() => this.deleteDraft(draft.uid)}
                  secondary={true}
                  label={this.props.local.drafts_delete} />
                <FlatButton
                  onClick={() => this.editDraft(draft.uid)}
                  label={this.props.local.drafts_edit} />
                {sendButtonContent}
              </CardActions>
            </Card>
          );
        });
      } else {
        content = (
          <div className='empty-placeholder'>
            <EmptyIcon color={grey300} style={{ width: 180, height: 180 }}/>
            <h1 style={{ color: grey300, fontWeight: 300 }}>{this.props.local.drafts_empty}</h1>
          </div>
        );
      }
    } else {
      let draft = this.getDraftByUid(this.state.change);
      let settings = {
        disableNotification: draft.disableNotification,
        disablePreview: draft.disablePreview,
        parser: draft.parse_mode,
      };
      content = (
        <WPostWrite
          text={draft.text}
          settings={settings}
          sendButtonContent={this.state.sendButtonContent}
          onCancel={this.cancelEditDraft}
          onSend={this.sendDraft}
          onSaveDraft={this.changeDraft}
          local={this.props.local}/>);
    }

    return (
      <div style={tags.contentStyle}>
        {content}
      </div>
    );
  }
}

module.exports = ContentBarDraft;
