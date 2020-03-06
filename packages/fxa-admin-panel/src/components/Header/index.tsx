import React, { ReactElement } from 'react';
import './index.scss';

type HeaderProps = {
  left: ReactElement;
  right: ReactElement;
};

export const Header = (props: HeaderProps) => {
  return (
    <header role="banner" className="header-page">
      <div className="container flex justify-space-between">
        <div className="flex">{props.left}</div>
        <div className="flex">{props.right}</div>
      </div>
    </header>
  );
};

export default Header;
