const { ListItem } = require('material-ui');

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

  render() {
    let nestedItems = [];

    this.items.map((item) => {
      nestedItems.push(
        <ListItem
          key={item.key}
          onClick={item.onClick}
          primaryText={this.props.local[item.text]}
        />);
    });

    return (
      <ListItem
        primaryText={this.props.local.menu}
        primaryTogglesNestedList={true}
        nestedItems={nestedItems}
        />
    );
  }
}

module.exports = SideBarMenu;
