import React from 'react';
import { FaYoutube, FaLinkedin } from "react-icons/fa6";

const Footer = () => {
  const links = [
    { icon: <FaLinkedin size={17} />, href: "https://linkedin.com/in/azanw", label: "LinkedIn" },
    { icon: <FaYoutube size={17} />, href: "https://youtube.com/@csconnectpk", label: "YouTube" },
  ];

  return (
    <footer className="w-full mt-auto border-t border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-sm text-zinc-400 text-center sm:text-left">
          Found any issues or have suggestions?{' '}
          <a
            href="mailto:hi@azanw.com"
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            hi@azanw.com
          </a>
        </p>

        <div className="mt-5 pt-4 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-600">
            Made by{' '}
            <a
              href="https://azanw.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Azan
            </a>
          </p>
          <div className="flex items-center gap-4">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
