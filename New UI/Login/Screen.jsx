import React from 'react';

const styles = {
  Screen: {
    backgroundColor: '#fafafa',
  },
};

const Screen = (props) => {
  return (
    <div style={styles.Screen}>
      {props.children}
    </div>
  );
};

export default Screen;