const React = require('react');
const { Text } = require('react-native');

const Dummy = (props) => React.createElement(Text, null, props && (props.name || 'icon'));

module.exports = {
  MaterialIcons: Dummy,
  Ionicons: Dummy,
  FontAwesome: Dummy,
  default: Dummy,
};
