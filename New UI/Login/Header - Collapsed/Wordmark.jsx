import React from 'react';

const styles = {
  Text: {
    color: '#ffcc00',
    fontSize: '32px',
    fontFamily: 'Poppins',
    fontWeight: 800,
    lineHeight: '42px',
  },
};

const defaultProps = {
  text: 'TaskCommand',
};

const Text = (props) => {
  return (
    <div style={styles.Text}>
      {props.text ?? defaultProps.text}
    </div>
  );
};

export default Text;