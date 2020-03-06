import React from 'react';
import LinkExternal from '../LinkExternal';
import './index.scss';

export const Footer = () => (
  <footer>
    <div className="container flex justify-flex-end">
      <LinkExternal href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral">
        <img src={require('../../images/moz-logo.svg')} alt="Mozilla logo" />
      </LinkExternal>
    </div>
  </footer>
);

export default Footer;
