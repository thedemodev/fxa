import React from 'react';

type LinkExternalProps = {
  className?: string;
  href: string;
  children: React.ReactNode;
};

export const LinkExternal = ({
  className,
  href,
  children,
}: LinkExternalProps) => (
  <a target="_blank" rel="noopener noreferrer" {...{ className }} {...{ href }}>
    {children}
  </a>
);

export default LinkExternal;
