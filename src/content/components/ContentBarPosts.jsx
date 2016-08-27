const React = require('react');
const {
  Card,
  CardHeader,
  CardText,
  CardActions,
  FlatButton,
  Chip,
  CircularProgress,
} = require('material-ui');
const { grey300 } = require('material-ui/styles/colors');
const EmptyIcon = require('material-ui/svg-icons/action/assignment-late').default;
const WPostWrite = require('./WPostWrite');
const parser = require('../js/parser');
const Utils = require('../js/Utils');
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  circProgressStyel: { marginTop: -8 },
  cardStyle: { marginTop: 8 },
  emptyStyle: { width: 180, height: 180 },
  h1Style: { color: grey300, fontWeight: 300 },
  contentStyle: { padding: '0px 8px 8px 8px' },
};

class ContentBarPosts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      change: null,
      sendButtonContent: this.props.local.post_send,
    };

    // Binding context
    this.onChange = this.onChange.bind(this);
    this.cancelEditPost = this.cancelEditPost.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  onChangeEnd() {
    this.setState({
      change: null,
      sendButtonContent: this.props.local.post_send,
    });
  }

  onChange(data) {
    const postData = data;
    postData.onEnd = () => this.onChangeEnd();
    postData.onStart = () => this.setState({
      sendButtonContent:
        <CircularProgress
          style={tags.circProgressStyle}
          size={0.4}
          color="#FFFFFF"
        />,
    });
    postData.post = this.getPostByUid(this.state.change.uid);

    this.props.signal.call('ChangePost', [postData]);
  }

  getPostByUid(uid) {
    for (let i = 0; i < this.props.posts.length; ++i) {
      if (this.props.posts[i].uid === uid) return this.props.posts[i];
    }
    return null;
  }

  editPost(uid) {
    this.setState({
      change: {
        uid,
      },
    });
  }

  cancelEditPost() {
    this.setState({
      change: null,
    });
  }

  deletePost(uid) {
    this.props.signal.call('DeletePost', [uid, () => this.forceUpdate()]);
  }

  render() {
    let content;

    if (this.state.change === null) {
      if (this.props.posts.length > 0) {
        content = [];
        this.props.posts.map(post => {
          const html = parser({
            mode: post.parse_mode,
            data: post.text,
          });

          content.push(
            <Card key={post.uid} style={tags.cardStyle}>
              <CardHeader
                title={post.chats.map((chat) => <Chip key={chat.chat_id}>{chat.name}</Chip>)}
                subtitle={Utils.getDateString(new Date(post.date * 1000))}
              />
              <CardText>
                <pre dangerouslySetInnerHTML={{ __html: html }} className="preview" />
              </CardText>
              <CardActions>
                <FlatButton
                  onClick={() => this.deletePost(post.uid)}
                  secondary
                  label={this.props.local.posts_delete}
                />
                <FlatButton
                  onClick={() => this.editPost(post.uid)}
                  label={this.props.local.posts_edit}
                />
              </CardActions>
            </Card>
          );
          return null;
        });
      } else {
        content = (
          <div className="empty-placeholder">
            <EmptyIcon color={grey300} style={tags.emptyStyle} />
            <h1 style={tags.h1Style}>{this.props.local.posts_empty}</h1>
          </div>
        );
      }
    } else {
      const post = this.getPostByUid(this.state.change.uid);
      const settings = {
        disableNotification: post.disableNotification,
        disablePreview: post.disablePreview,
        parser: post.parse_mode,
      };
      content = (
        <WPostWrite
          text={post.text}
          settings={settings}
          sendButtonContent={this.state.sendButtonContent}
          onCancel={this.cancelEditPost}
          onSend={this.onChange}
          local={this.props.local}
        />);
    }

    return (
      <div style={tags.contentStyle}>
        {content}
      </div>
    );
  }
}
ContentBarPosts.propTypes = {
  signal: React.PropTypes.func,
  local: React.PropTypes.object,
  posts: React.PropTypes.array,
};

module.exports = ContentBarPosts;
