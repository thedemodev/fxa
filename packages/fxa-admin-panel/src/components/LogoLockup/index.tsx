import React from 'react';
import './index.scss';

type LogoLockupProps = {
  src: string;
  alt: string;
  text: string;
};

export const LogoLockup = ({ src, alt, text }: LogoLockupProps) => (
  <>
    <img
      className="logo inline-flex"
      src={require(`../../images/${src}`)}
      {...{ alt }}
    />
    <h1 className="inline-flex">{text}</h1>
  </>
);

export default LogoLockup;
