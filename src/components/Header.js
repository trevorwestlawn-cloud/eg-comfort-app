import React from 'react';
import './Header.css';
import { CONFIG } from '../config/config';

function Header() {
  return (
    <header className="eg-header">
      <div className="header-container">
        <div className="header-content">
          <h1 className="header-brand">{CONFIG.brand.shortName}</h1>
          <p className="header-tagline">{CONFIG.brand.tagline}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
