/* eslint-disable no-alert */
const React = require('react');
const { Paper, Snackbar } = require('material-ui');
const { Layout, Fixed, Flex } = require('react-layout-pane');
const { ipcRenderer } = window;
const { MuiThemeProvider, getMuiTheme } = require('material-ui/styles');
const darkBaseTheme = require('material-ui/styles/baseThemes/darkBaseTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const SideBar = require('./components/SideBar');
const ContentBar = require('./components/ContentBar');
const PropTypes = require('prop-types');
const botavatarURL = require('./assets/botavatar.png');

const langs = {
  /* eslint-disable global-require */
  ru: require('./langs/ru'),
  en: require('./langs/en'),
  /* eslint-enable global-require */
};

const TGAPI = require('./js/API');
const Signal = require('./js/Signal');
const Utils = require('./js/Utils');

const usernameRegex = /[@-].{5,}/;
const tokenRegex = /\d{9}:.{30,}/;

const tags = {
  paperStyle: { height: '100%', width: 256 },
  contentStyle: { overflow: 'auto' },
};

class Chad extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: JSON.parse(localStorage.getItem('posts') || '[]'),
      drafts: JSON.parse(localStorage.getItem('drafts') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings')),
      botavatar: (localStorage.getItem('botavatar') || botavatarURL),
      bot: JSON.parse(localStorage.getItem('bot') || '{}'),
      channels: JSON.parse(localStorage.getItem('channels') || '[]'),
      snackbar: {
        open: false,
        text: '',
      },
    };

    this.local = langs[this.state.settings.lang];
    ipcRenderer.send('build-menu', this.local);
    ipcRenderer.send('check-updates', this.local);
    this.signal = new Signal();

    this.token = this.state.bot.token || null;
    this.API = this.token !== null ? new TGAPI(this.token) : null;

    this.signal.register('LanguageChange', v => this.languageChange(v));
    this.signal.register('DarkThemeChange', v => this.darkThemeChange(v));
    this.signal.register('PostWriteDefaultsChange', v => this.postWriteDefaultsChange(v));
    this.signal.register('SendPost', d => this.sendPost(d));
    this.signal.register('NewChannel', d => this.newChannel(d));
    this.signal.register('RemoveChannel', (i, h) => this.removeChannel(i, h));
    this.signal.register('SetAdminBot', (t, o) => this.setAdminBot(t, o));
    this.signal.register('RemoveAdminBot', () => this.removeAdminBot());
    this.signal.register('DeletePost', (i, h) => this.deletePost(i, h));
    this.signal.register('ChangePost', d => this.changePost(d));
    this.signal.register('DeleteDraft', (i, h) => this.deleteDraft(i, h));
    this.signal.register('SaveDraft', d => this.saveDraft(d));
    this.signal.register('ChangeDraft', d => this.changeDraft(d));

    // Binding context
    this.closeSnackbar = this.closeSnackbar.bind(this);
  }

  getPostIndexByUid(uid) {
    for (let i = 0; i < this.state.posts.length; i += 1) {
      if (this.state.posts[i].uid === uid) return i;
    }
    return null;
  }

  getDraftIndexByUid(uid) {
    for (let i = 0; i < this.state.drafts.length; i += 1) {
      if (this.state.drafts[i].uid === uid) return i;
    }
    return null;
  }

  setAdminBot(token, onPass) {
    if (!token || token.length < 30) {
      return alert(this.loca.alert_invalid_token);
    }

    if (!tokenRegex.test(token)) {
      return alert(this.local.alert_invalid_token_format);
    }

    if (onPass) onPass();

    this.API = new TGAPI(token);
    const API = this.API;

    const signal = this.signal;
    signal.call('SetLoadState', [true]);

    API.getMe().then((res) => {
      const getMe = res.body;
      if (getMe.ok) {
        getMe.result.token = token;

        localStorage.setItem('bot', JSON.stringify(getMe.result));
        this.token = token;
        this.setState({
          bot: getMe.result,
        }, () => signal.call('SetLoadState', [false]));
        this.updateBotProfilePhoto(getMe.result.id);
      }
    }, () => {
      signal.call('SetLoadState', [false]);
      alert(this.local.alert_cant_find_bot);
    });

    return null;
  }

  removeChannel(id, onRemove) {
    const channels = this.state.channels;

    for (let i = 0; i < channels.length; i += 1) {
      if (channels[i].uid === id) {
        channels.splice(i, 1);
        return this.setState({
          channels,
        }, () => {
          localStorage.setItem('channels', JSON.stringify(channels));
          onRemove();
        });
      }
    }

    return null;
  }

  newChannel(data) {
    if (!data.name || data.name.length === 0) {
      return alert(this.local.alert_channel_name_short);
    }

    if (!data.username || !usernameRegex.test(data.username)) {
      return alert(this.local.alert_invalid_channel_name);
    }

    const channels = this.state.channels;
    channels.push({
      name: data.name,
      username: data.username,
      uid: Utils.uid(),
    });

    this.setState({
      channels,
    }, () => localStorage.setItem('channels', JSON.stringify(channels)));

    return null;
  }

  changePost(data) {
    if (this.token === null) {
      return alert(this.local.alert_add_admin_bot);
    }

    if (data.text.length < 1) {
      return alert(this.loca.alert_post_text_empty);
    }

    data.onStart.apply(null);

    const params = {
      text: data.text,
      disable_web_page_preview: data.disablePreview,
      parse_mode: data.parser,
    };

    const listToSend = data.post.chats.slice(0);

    const API = this.API;
    function sendRec(list, onend) {
      params.chat_id = list[0].chat_id;
      params.message_id = list[0].message_id;

      if (typeof params.chat_id === 'string') {
        params.chat_id = `@${params.chat_id}`;
      }

      API.editMessageText(params).then((res) => {
        const success = res.body;
        if (success.ok) {
          list.splice(0, 1);
          if (list.length) {
            sendRec(list, onend);
          }
        } else {
          alert(this.local.alert_something_wrong);
          onend(success);
        }

        if (!list.length) {
          onend(success);
        }
      });
    }

    sendRec(listToSend, (success) => {
      data.onEnd.apply(null);
      const post = data.post;
      post.date = success.result.date;
      post.edit_date = success.result.edit_date || null;
      post.text = data.text || null;
      post.parse_mode = params.parse_mode;
      post.disableNotification = params.disable_notification;
      post.disablePreview = params.disable_web_page_preview;
      const posts = this.state.posts;
      posts[this.getPostIndexByUid(data.post.uid)] = post;
      localStorage.setItem('posts', JSON.stringify(posts));
      this.setState({
        posts,
      });
    });

    return null;
  }

  sendPost(data) {
    const state = this.state;
    const listToSend = this.signal.call('SelectedChannels');

    if (listToSend.length < 1) {
      return alert(this.local.alert_select_channel_to_send);
    }

    if (this.token === null) {
      return alert(this.local.alert_add_admin_bot);
    }

    if (data.text.length < 1) {
      return alert(this.local.alert_post_text_empty);
    }

    data.onStart.apply(null);

    const params = {
      text: data.text,
      disable_web_page_preview: data.disablePreview,
      disable_notification: data.disableNotification,
      parse_mode: data.parser,
    };

    const post = {
      chats: [],
    };

    const API = this.API;
    function sendRec(list, onend) {
      params.chat_id = list[0];

      API.sendMessage(params).then((res) => {
        const success = res.body;
        if (success.ok) {
          post.chats.push({
            name: success.result.chat.title || '',
            message_id: success.result.message_id,
            chat_id: (success.result.chat.type === 'channel') ?
              success.result.chat.username :
              success.result.chat.id,
          });
          list.splice(0, 1);
          if (list.length) {
            sendRec(list, onend);
          }
        } else {
          alert(this.local.alert_something_wrong);
          onend(success);
        }

        if (!list.length) {
          onend(success);
        }
      });
    }

    sendRec(listToSend, (success) => {
      data.onEnd.apply(null);
      post.date = success.result.date;
      post.edit_date = success.result.edit_date || null;
      post.text = data.text || null;
      post.parse_mode = params.parse_mode;
      post.disableNotification = params.disable_notification;
      post.disablePreview = params.disable_web_page_preview;
      post.uid = Utils.uid2();
      state.posts.unshift(post);
      localStorage.setItem('posts', JSON.stringify(state.posts));
      this.setState(state);
    });
    return null;
  }

  closeSnackbar() {
    this.setState({
      snackbar: {
        open: false,
        text: '',
      },
    });
  }

  makeSnackbar(text) {
    this.setState({
      snackbar: {
        open: true,
        text,
      },
    });
  }

  postWriteDefaultsChange(value) {
    const state = this.state;
    state.settings.postWriteDefaults = value;
    localStorage.setItem('settings', JSON.stringify(state.settings));
    this.setState(state);
  }

  darkThemeChange(value) {
    const state = this.state;
    state.settings.darkTheme = value;
    localStorage.setItem('settings', JSON.stringify(state.settings));
    this.setState(state, this.props.deepForceUpdate);
  }

  languageChange(value) {
    const state = this.state;
    state.settings.lang = value;
    localStorage.setItem('settings', JSON.stringify(state.settings));
    this.local = langs[value];
    this.setState(state);
    ipcRenderer.send('build-menu', this.local);
  }

  updateBotProfilePhoto(id) {
    const userId = id !== undefined ? id : this.props.bot.id;

    const API = this.API;

    this.signal.call('SetAvatarLoadState', [true]);
    API.getBase64Avatar(userId).then((res) => {
      const botavatar = res === null ? botavatarURL : res;
      localStorage.setItem('botavatar', botavatar);
      this.setState({
        botavatar,
      }, () => this.signal.call('SetAvatarLoadState', [false]));
    });
  }

  removeAdminBot() {
    localStorage.removeItem('bot');
    localStorage.removeItem('botavatar');
    this.setState({
      bot: {},
      botavatar: botavatarURL,
    });
  }

  deletePost(uid, onDelete) {
    const posts = this.state.posts;
    for (let i = 0; i < posts.length; i += 1) {
      if (posts[i].uid === uid) {
        posts.splice(i, 1);
        return this.setState({
          posts,
        }, () => {
          localStorage.setItem('posts', JSON.stringify(posts));
          onDelete();
        });
      }
    }
    return null;
  }

  deleteDraft(uid, onDelete) {
    const drafts = this.state.drafts;
    for (let i = 0; i < drafts.length; i += 1) {
      if (drafts[i].uid === uid) {
        drafts.splice(i, 1);
        return this.setState({
          drafts,
        }, () => {
          localStorage.setItem('drafts', JSON.stringify(drafts));
          onDelete();
        });
      }
    }
    return null;
  }

  saveDraft(data) {
    if (data.text.length < 1) {
      return alert(this.local.alert_post_text_empty);
    }

    const draftData = data;
    draftData.uid = Utils.uid2();
    const drafts = this.state.drafts;
    drafts.unshift(draftData);
    this.setState({
      drafts,
    }, () => this.makeSnackbar(this.local.snackbar_draft_saved));
    localStorage.setItem('drafts', JSON.stringify(drafts));
    return null;
  }

  changeDraft(data) {
    if (data.text.length < 1) {
      return alert(this.local.alert_post_text_empty);
    }

    const drafts = this.state.drafts;
    drafts[this.getDraftIndexByUid(data.uid)] = data;
    this.setState({
      drafts,
    });
    localStorage.setItem('drafts', JSON.stringify(drafts));
    return null;
  }

  render() {
    const SideBarData = {
      lang: this.state.settings.lang,
      darkTheme: this.state.settings.darkTheme,
      postWriteDefaults: this.state.settings.postWriteDefaults,
      channels: this.state.channels,
      bot: {
        avatar: this.state.botavatar,
        name: this.state.bot.first_name,
        username: `@${this.state.bot.username}`,
        token: this.token,
      },
    };

    const ContentBarData = {
      posts: this.state.posts,
      drafts: this.state.drafts,
      postWriteDefaults: this.state.settings.postWriteDefaults,
    };

    const theme = this.state.settings.darkTheme ? darkBaseTheme : lightBaseTheme;

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <Layout type="column" style={{ backgroundColor: theme.palette.canvasColor }}>
          <Flex>
            <Layout type="row">
              <Fixed>
                <Paper style={tags.paperStyle} zDepth={1} rounded={false}>
                  <SideBar
                    signal={this.signal}
                    data={SideBarData}
                    local={this.local}
                  />
                </Paper>
              </Fixed>
              <Flex style={tags.contentStyle}>
                <ContentBar
                  data={ContentBarData}
                  local={this.local}
                  signal={this.signal}
                />
              </Flex>
            </Layout>
          </Flex>
          <Snackbar
            open={this.state.snackbar.open}
            message={this.state.snackbar.text}
            autoHideDuration={4000}
            onRequestClose={this.closeSnackbar}
          />
        </Layout>
      </MuiThemeProvider>
    );
  }
}

/* eslint-disable react/no-unused-prop-types */
Chad.propTypes = {
  deepForceUpdate: PropTypes.func,
  bot: PropTypes.shape({
    id: PropTypes.number,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
  }),
};
/* eslint-enable react/no-unused-prop-types */

module.exports = Chad;
