import React from 'react';
import Header from '../../components/Header';
import LogoLockup from '../../components/LogoLockup';
import LinkAbout from '../../components/LinkAbout';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import './index.scss';

type AppLayoutProps = {
  children: any;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const logoLockup = (
    <LogoLockup
      src="ff-logo.svg"
      alt="Firefox logo"
      text="Firefox Accounts Admin Panel"
    />
  );

  return (
    <>
      <Header left={logoLockup} right={<LinkAbout />} />
      <div className="container content-wrapper">
        <Nav />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  );
};

export default AppLayout;
