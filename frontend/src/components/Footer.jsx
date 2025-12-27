import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-700 to-teal-600 text-white mt-20 pt-12 pb-6 px-6 md:px-16">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-white/20 pb-10">
        {/* About Section */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">ZingHR</h2>
            <p className="text-sm text-gray-100 leading-relaxed">
              ZingHR is built for organizations that value people.  
              We help simplify HR, payroll, and performance through smart automation.
            </p>
          </div>

          {/* Social Media */}
          <div className="flex gap-4 mt-5">
            <FaFacebookF className="hover:text-blue-300 cursor-pointer transition" />
            <FaInstagram className="hover:text-pink-400 cursor-pointer transition" />
            <FaLinkedinIn className="hover:text-blue-400 cursor-pointer transition" />
            <FaPinterestP className="hover:text-red-400 cursor-pointer transition" />
            <FaTwitter className="hover:text-blue-300 cursor-pointer transition" />
            <FaYoutube className="hover:text-red-500 cursor-pointer transition" />
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">HR Software</h3>
            <ul className="space-y-2 text-sm text-gray-100">
              <li className="hover:text-white cursor-pointer">Employee Profiles</li>
              <li className="hover:text-white cursor-pointer">Documents</li>
              <li className="hover:text-white cursor-pointer">Helpdesk</li>
              <li className="hover:text-white cursor-pointer">HR Analytics</li>
              <li className="hover:text-white cursor-pointer">Payroll</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Performance</h3>
            <ul className="space-y-2 text-sm text-gray-100">
              <li className="hover:text-white cursor-pointer">OKR Software</li>
              <li className="hover:text-white cursor-pointer">Feedback</li>
              <li className="hover:text-white cursor-pointer">Performance Reviews</li>
              <li className="hover:text-white cursor-pointer">Learning System</li>
              <li className="hover:text-white cursor-pointer">Attendance</li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Contact Us</h3>
            <p className="text-sm text-gray-100">📞 +91 98765 43210</p>
            <p className="text-sm text-gray-100">✉️ support@zinghr.com</p>
            <p className="text-sm text-gray-100 mt-2">
              14th Floor, Sky Tower Business Park,<br />
              Bengaluru, India 560001
            </p>
          </div>

          <button className="mt-6 w-fit px-5 py-2 bg-white text-green-700 font-medium rounded-lg hover:bg-green-100 transition">
            Contact Us
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 text-center text-sm text-gray-100">
        <p>© {new Date().getFullYear()} ZingHR Technologies Pvt. Ltd. | All Rights Reserved</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-200 flex-wrap">
          <span className="hover:text-white cursor-pointer">Security Policy</span>
          <span>|</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span>|</span>
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span>|</span>
          <span className="hover:text-white cursor-pointer">Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
