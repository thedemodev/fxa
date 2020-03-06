import React from 'react';
import LinkExternal from '../LinkExternal';
import './index.scss';

export const LinkAbout = () => (
  <LinkExternal
    className="about-link inline-flex align-self-center"
    href="https://github.com/mozilla/fxa/blob/master/packages/fxa-admin-panel/README.md"
  >
    <span>About</span>{' '}
    <img
      className="inline-flex icon"
      src={require('../../images/icon-external-link.svg')}
      alt="external link"
    />
  </LinkExternal>
);

export default LinkAbout;
