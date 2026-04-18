import React from 'react';
import './Footer.css';
import { CONFIG } from '../config/config';

function Footer() {
  return (
    <footer className="eg-footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>{CONFIG.disclaimers.general}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#666' }}>
            © 2026 {CONFIG.brand.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
