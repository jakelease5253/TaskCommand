import React from 'react';

const styles = {
  Card: {
    top: '0px',
    left: '0px',
    width: '84px',
    height: '2030px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
  },
};

const Card = (props) => {
  return (
    <div style={styles.Card}>
      {props.children}
    </div>
  );
};

export default Card;