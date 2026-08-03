import React from 'react';

const styles = {
  Text: {
    color: '#000000',
    fontSize: '14px',
    fontFamily: 'Poppins',
    lineHeight: '16px',
  },
};

const defaultProps = {
  text: 'Monday, November 3',
};

const Text = (props) => {
  return (
    <div style={styles.Text}>
      {props.text ?? defaultProps.text}
    </div>
  );
};

export default Text;