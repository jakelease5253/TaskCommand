import React from 'react';

const styles = {
  Button: {
    cursor: 'pointer',
    top: '385px',
    left: '20px',
    width: '46px',
    height: '46px',
    padding: '0px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    border: '0',
    boxSizing: 'border-box',
    borderRadius: '8px',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#030303',
    fontSize: '14px',
    fontFamily: 'Poppins',
    lineHeight: '16px',
    outline: 'none',
  },
  Icon: {
    fontSize: '21px',
    width: '21px',
    height: '21px',
    color: '#030303',
    fill: '#030303',
  },
};

const IconComponent = () => (
  <svg style={styles.Icon}  viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none">
    </path>
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z">
    </path>
  </svg>
);

const defaultProps = {
  label: '',
  IconComponent,
};

const Button = (props) => {
  return (
    <button style={styles.Button}>
      <span>{props.label ?? defaultProps.label}</span>
      {
        props.IconComponent 
          ? <props.IconComponent style={styles.Icon} /> 
          : <defaultProps.IconComponent />
      }
    </button>
  );
};

export default Button;