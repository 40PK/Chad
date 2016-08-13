const {Card,  CardText,  CardActions,  FlatButton,  CircularProgress} = require("material-ui");

const {grey300} = require("material-ui/styles/colors");

const EmptyIcon = require("material-ui/svg-icons/action/assignment-late").default;

const WPostWrite = require("./WPostWrite");

const parser = require("../js/parser");

class ContentBarDraft extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      change: null,
      sending: null,
      sendButtonContent: this.props.local.drafts_send
    };
    this.props.signal.register("PostDraftBtn", (v => this.setState({
      sendButtonContent: v
    })));
  }
  deleteDraft(uid) {
    this.props.signal.call("DeleteDraft", [ uid ]);
  }
  editDraft(uid) {
    this.setState({
      change: uid
    });
  }
  onSendDraftEnd(uid) {
    this.setState({
      change: null,
      sending: null,
      sendButtonContent: this.props.local.post_send
    });
    this.deleteDraft(uid);
  }
  sendDraft(data, uid) {
    data.onEnd = (() => this.onSendDraftEnd(uid));
    data.onStart = (() => this.setState({
      sendButtonContent: React.createElement(CircularProgress, {
        style: {
          marginTop: -8
        },
        size: .4,
        color: "#FFFFFF"
      })
    }));
    this.props.signal.call("SendPost", [ data ]);
  }
  sendDraftByUid(uid) {
    let data = this.getDraftByUid(uid);
    data.onEnd = (() => this.onSendDraftEnd(uid));
    data.onStart = (() => this.setState({
      sending: uid
    }));
    this.props.signal.call("SendPost", [ data ]);
  }
  changeDraft(data) {
    data.uid = this.state.change;
    this.props.signal.call("ChangeDraft", [ data ]);
    this.setState({
      change: null
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
        this.props.drafts.map((draft => {
          let html = parser({
            mode: draft.parse_mode,
            data: draft.text
          });
          let sendButtonContent = this.state.sending === draft.uid ? React.createElement(FlatButton, {
            onClick: e => this.sendDraftByUid(draft.uid),
            primary: true,
            icon: React.createElement(CircularProgress, {
              style: {
                marginTop: -8
              },
              size: .4
            })
          }) : React.createElement(FlatButton, {
            onClick: e => this.sendDraftByUid(draft.uid),
            primary: true,
            label: this.props.local.drafts_send
          });
          content.push(React.createElement(Card, {
            key: draft.uid,
            style: {
              marginTop: 8
            }
          }, React.createElement(CardText, null, React.createElement("pre", {
            dangerouslySetInnerHTML: {
              __html: html
            },
            className: "preview"
          })), React.createElement(CardActions, null, React.createElement(FlatButton, {
            onClick: () => this.deleteDraft(draft.uid),
            secondary: true,
            label: this.props.local.drafts_delete
          }), React.createElement(FlatButton, {
            onClick: () => this.editDraft(draft.uid),
            label: this.props.local.drafts_edit
          }), sendButtonContent)));
        }));
      } else {
        content = React.createElement("div", {
          className: "empty-placeholder"
        }, React.createElement(EmptyIcon, {
          color: grey300,
          style: {
            width: 180,
            height: 180
          }
        }), React.createElement("h1", {
          style: {
            color: grey300,
            fontWeight: 300
          }
        }, this.props.local.drafts_empty));
      }
    } else {
      let draft = this.getDraftByUid(this.state.change);
      let settings = {
        disableNotification: draft.disableNotification,
        disablePreview: draft.disablePreview,
        parser: draft.parse_mode
      };
      content = React.createElement(WPostWrite, {
        text: draft.text,
        settings: settings,
        sendButtonContent: this.state.sendButtonContent,
        onCancel: () => this.setState({
          change: null
        }),
        onSend: d => this.sendDraft(d, this.state.change),
        onSaveDraft: d => this.changeDraft(d),
        local: this.props.local
      });
    }
    return React.createElement("div", {
      style: {
        padding: "0px 8px 8px 8px"
      }
    }, content);
  }
}

module.exports = ContentBarDraft;