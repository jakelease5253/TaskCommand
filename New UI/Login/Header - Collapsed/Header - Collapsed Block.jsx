import React from 'react';

const styles = {
  Header: {
    top: '0px',
    left: '84px',
    width: '1356px',
    height: '72px',
    backgroundColor: '#ffffff',
    boxShadow: '0px 1px 12px rgba(193,193,193,0.25)',
  },
};

const Header = (props) => {
  return (
    <div style={styles.Header}>
      {props.children}
    </div>
  );
};

export default Header;