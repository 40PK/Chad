const React = require('react');
const { ListItem } = require('material-ui');
const shallowCompare = require('react-addons-shallow-compare');
const PropTypes = require('prop-types');

class SideBarMenu extends React.Component {
  constructor(props) {
    super(props);

    this.items = [
      {
        key: 1,
        text: 'menu_write_post',
        onClick: () => this.props.signal.call('MenuWritePost'),
      }, {
        key: 2,
        text: 'menu_posts',
        onClick: () => this.props.signal.call('MenuPosts'),
      }, {
        key: 3,
        text: 'menu_drafts',
        onClick: () => this.props.signal.call('MenuDrafts'),
      }, {
        key: 4,
        text: 'menu_preferences',
        onClick: () => this.props.signal.call('MenuPreferences'),
      }, {
        key: 5,
        text: 'menu_about',
        onClick: () => this.props.signal.call('MenuAbout'),
      },
    ];
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const nestedItems = [];

    this.items.map((item) => {
      nestedItems.push(
        <ListItem
          key={item.key}
          onClick={item.onClick}
          primaryText={this.props.local[item.text]}
        />);
      return null;
    });

    return (
      <ListItem
        primaryText={this.props.local.menu}
        primaryTogglesNestedList
        nestedItems={nestedItems}
      />
    );
  }
}
SideBarMenu.propTypes = {
  signal: PropTypes.object,
  local: PropTypes.object,
};

module.exports = SideBarMenu;
