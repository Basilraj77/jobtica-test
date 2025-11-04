
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  prefix?: 'fas' | 'far' | 'fab'; // fas=solid, far=regular, fab=brands
}

const Icon: React.FC<IconProps> = ({ name, className, prefix = 'fas' }) => {
  return <i className={`${prefix} fa-${name} ${className || ''}`} aria-hidden="true"></i>;
};

export default Icon;
