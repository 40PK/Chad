const {Card,  CardHeader,  CardText,  CardActions,  FlatButton,  Chip,  CircularProgress} = require("material-ui");

const {grey300} = require("material-ui/styles/colors");

const EmptyIcon = require("material-ui/svg-icons/action/assignment-late").default;

const WPostWrite = require("./WPostWrite");

const parser = require("../js/parser");

const Utils = require("../js/Utils");

class ContentBarPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      change: null,
      sendButtonContent: this.props.local.post_send
    };
  }
  deletePost(uid) {
    this.props.signal.call("DeletePost", [ uid ]);
  }
  editPost(uid) {
    this.setState({
      change: {
        uid: uid
      }
    });
  }
  onChangeEnd() {
    this.setState({
      change: null,
      sendButtonContent: this.props.local.post_send
    });
  }
  onChange(data) {
    data.onEnd = (() => this.onChangeEnd());
    data.onStart = (() => this.setState({
      sendButtonContent: React.createElement(CircularProgress, {
        style: {
          marginTop: -8
        },
        size: .4,
        color: "#FFFFFF"
      })
    }));
    data.post = this.getPostByUid(this.state.change.uid);
    this.props.signal.call("ChangePost", [ data ]);
  }
  getPostByUid(uid) {
    for (let i = 0; i < this.props.posts.length; ++i) {
      if (this.props.posts[i].uid === uid) return this.props.posts[i];
    }
  }
  render() {
    let content;
    if (this.state.change === null) {
      if (this.props.posts.length > 0) {
        content = [];
        this.props.posts.map((post => {
          let html = parser({
            mode: post.parse_mode,
            data: post.text
          });
          content.push(React.createElement(Card, {
            key: post.uid,
            style: {
              marginTop: 8
            }
          }, React.createElement(CardHeader, {
            title: post.chats.map((chat => React.createElement(Chip, {
              key: chat.chat_id
            }, chat.name))),
            subtitle: Utils.getDateString(new Date(post.date * 1e3))
          }), React.createElement(CardText, null, React.createElement("pre", {
            dangerouslySetInnerHTML: {
              __html: html
            },
            className: "preview"
          })), React.createElement(CardActions, null, React.createElement(FlatButton, {
            onClick: () => this.deletePost(post.uid),
            secondary: true,
            label: this.props.local.posts_delete
          }), React.createElement(FlatButton, {
            onClick: () => this.editPost(post.uid),
            label: this.props.local.posts_edit
          }))));
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
        }, this.props.local.posts_empty));
      }
    } else {
      let post = this.getPostByUid(this.state.change.uid);
      let settings = {
        disableNotification: post.disableNotification,
        disablePreview: post.disablePreview,
        parser: post.parse_mode
      };
      content = React.createElement(WPostWrite, {
        text: post.text,
        settings: settings,
        sendButtonContent: this.state.sendButtonContent,
        onCancel: () => this.setState({
          change: null
        }),
        onSend: d => this.onChange(d),
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

module.exports = ContentBarPosts;