const ContentBarPostWrite = require('./ContentBarPostWrite');
const ContentBarPosts = require('./ContentBarPosts');
const ContentBarDrafts = require('./ContentBarDrafts');

class ContentBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: 'PostWrite',
    };

    this.props.signal.register('MenuWritePost', () => this.setState({ content: 'PostWrite' }));
    this.props.signal.register('MenuPosts', () => this.setState({ content: 'Posts' }));
    this.props.signal.register('MenuDrafts', () => this.setState({ content: 'Drafts' }));
  }

  render() {
    let content;
    if (this.state.content === 'PostWrite') {
      content = <ContentBarPostWrite
                  signal={this.props.signal}
                  local={this.props.local} />;
    } else if (this.state.content === 'Posts') {
      content = <ContentBarPosts
                  posts={this.props.data.posts}
                  signal={this.props.signal}
                  local={this.props.local} />;
    } else if (this.state.content === 'Drafts') {
      content = <ContentBarDrafts
                  drafts={this.props.data.drafts}
                  signal={this.props.signal}
                  local={this.props.local} />;
    }

    return (
      <div className='content-bar'>
        {content}
      </div>
    );
  }
}

module.exports = ContentBar;
