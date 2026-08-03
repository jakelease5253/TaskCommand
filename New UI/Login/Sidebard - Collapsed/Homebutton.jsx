import React from 'react';

const styles = {
  Button: {
    cursor: 'pointer',
    top: '121px',
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
    backgroundColor: '#030303',
    color: '#ffcc00',
    fontSize: '14px',
    fontFamily: 'Poppins',
    lineHeight: '16px',
    outline: 'none',
  },
  Icon: {
    fontSize: '21px',
    width: '21px',
    height: '21px',
    color: '#ffcc00',
    fill: '#ffcc00',
  },
};

const IconComponent = () => (
  <svg style={styles.Icon}  viewBox="0 0 448 512">
    <path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z">
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