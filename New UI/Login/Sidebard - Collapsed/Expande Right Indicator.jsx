import React from 'react';

const styles = {
  Button: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: '35px',
    left: '72px',
    width: '20px',
    height: '20px',
    border: '0',
    boxSizing: 'border-box',
    borderRadius: '8px',
    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
    color: '#030303',
    backgroundColor: '#ffcc00',
    outline: 'none',
  },
  Icon: {
    color: '#030303',
    fill: '#030303',
    width: '14px',
    height: '14px',
    fontSize: '14px',
  },
};

const IconComponent = () => (
  <svg style={styles.Icon}  viewBox="0 0 24 24">
    <path d="M0 0h24v24H0V0z" fill="none">
    </path>
    <path d="M6.23 20.23 8 22l10-10L8 2 6.23 3.77 14.46 12z">
    </path>
  </svg>
);

const defaultProps = {
  IconComponent,
};

const IconButton = (props) => {
  return (
    <button style={styles.Button}>
      {
        props.IconComponent 
          ? <props.IconComponent style={styles.Icon} /> 
          : <defaultProps.IconComponent />
      }
    </button>
  );
};

export default IconButton;