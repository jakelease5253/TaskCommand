import React from 'react';

const styles = {
  ImageContainer: {
    top: '11px',
    left: '1370px',
    width: '50px',
    height: '50px',
    borderRadius: '100px',
    backgroundImage: 'url(./image.jpeg)',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
};

const defaultProps = {
  image: 'https://images.unsplash.com/photo-1617175581263-bc0f059cce38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMDUzMDJ8MHwxfHNlYXJjaHwxMHx8cG9ydGFpdHxlbnwxfHx8fDE2NjkwNjMyMjA&ixlib=rb-4.0.3&q=80&w=1080',
}

const Image = (props) => {
  return (
    <div style={{
      ...styles.ImageContainer,
      backgroundImage: `url(${props.image ?? defaultProps.image})`,
    }} />
  );
};

export default Image;