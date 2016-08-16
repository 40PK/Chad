const {
  Paper,
  Subheader,
  Divider,
} = require('material-ui');
const { Layout, Fixed, Flex } = require('react-layout-pane');
const previewParser = require('../js/parser');
const shallowCompare = require('react-addons-shallow-compare');

const tags = {
  previewStyle: { width: '100%', height: '100%' },
  previewContainerStyle: { height: 100 },
};

class WPostWritePreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preview: previewParser({
        data: this.props.text,
        mode: this.props.parser,
      }),
    };

    this.updatePreview = this.updatePreview.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  updatePreview(text, parser) {
    this.setState({
      preview: previewParser({
        data: text,
        mode: parser,
      }),
    });
  }

  render() {
    return (
      <Paper style={tags.previewStyle} zDepth={1} rounded={false}>
        <Layout type='column'>
          <Fixed>
            <Subheader>{this.props.local.preview}</Subheader>
            <Divider />
          </Fixed>
          <Flex style={tags.previewContainerStyle}>
            <div className='preview-overflow'>
              <pre
                dangerouslySetInnerHTML={{ __html: this.state.preview }}
                className='preview'></pre>
            </div>
          </Flex>
        </Layout>
      </Paper>
    );
  }
}

module.exports = WPostWritePreview;
