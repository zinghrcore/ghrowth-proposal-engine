// Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 text-white py-8 text-center text-sm mt-20 shadow-inner">
      <div className="space-y-1">
        <p className="text-lg font-extrabold tracking-wide">ZingHR</p>
        <p className="text-gray-200">
          © 2026 <span className="font-semibold text-white">ZingHR Technologies Pvt. Ltd.</span> | All rights reserved.
        </p>
        <p className="text-blue-200 text-sm">
          Enterprise HCM Solutions |{" "}
          <a
            href="https://www.zinghr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 hover:text-yellow-400 font-medium"
          >
            www.zinghr.com
          </a>{" "}
          | info@zinghr.com
        </p>
      </div>
    </footer>
  );
};

export default Footer;
