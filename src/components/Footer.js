import React from 'react';
import { FaLinkedinIn, FaYoutube, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: FaLinkedinIn,
      href: 'https://linkedin.com/in/azanw',
      color: 'text-gray-400 hover:text-[#0077B5]'
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      href: 'https://youtube.com/@csconnectpk',
      color: 'text-gray-400 hover:text-[#FF0000]'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      href: 'https://instagram.com/csconnectpk',
      color: 'text-gray-400 hover:text-[#E4405F]'
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      href: 'https://github.com/azannw',
      color: 'text-gray-400 hover:text-gray-800'
    }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="text-center">
          {/* Made by Azan */}
          <div className="mb-4 sm:mb-6">
            <span className="text-gray-400 text-base sm:text-lg">Made by </span>
            <a 
              href="https://azanw.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 text-base sm:text-lg font-semibold hover:text-blue-300 cursor-pointer"
            >
              Azan
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center space-x-6 sm:space-x-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color}`}
                title={social.name}
              >
                <social.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 