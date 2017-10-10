const replace = require('stream-replace');

module.exports = ({modify} = null, stream) => {
  if (!modify) {
    return stream;
  }

  const {patch} = modify;

  patch.forEach(({pattern, append, prepend, custom}) => {
    stream = stream.pipe(applyModification(pattern, {append, prepend, custom}));
  });

  return stream;
};

const applyModification = (pattern, {append, prepend, custom}) => {
  return replace(pattern, (match, parameter, defaultValue) => {
    if (typeof append !== 'undefined') {
      return match + append;
    }

    if (typeof prepend !== 'undefined') {
      return prepend + match;
    }

    if (typeof custom === 'function') {
      return custom(match, parameter, defaultValue);
    }

    return match;
  });
};
