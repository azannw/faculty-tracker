import React from 'react';
import { FaYoutube, FaLinkedin, FaWhatsapp } from "react-icons/fa6";

const Footer = ({ darkMode }) => {
  const links = [
    { icon: <FaLinkedin size={20} />, href: "https://linkedin.com/in/azanw", label: "LinkedIn" },
    { icon: <FaYoutube size={20} />, href: "https://youtube.com/@csconnectpk", label: "YouTube" },
    { icon: <FaWhatsapp size={20} />, href: "https://chat.whatsapp.com/K1vRPmsHIgxJY842UPUjoB", label: "WhatsApp" }
  ];

  return (
    <footer className={`w-full py-8 mt-auto border-t transition-colors duration-300 ${
      darkMode ? 'border-gray-900 bg-black text-gray-400' : 'border-gray-100 bg-white text-gray-500'
    }`}>
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>Made by</span>
          <a 
            href="https://azanw.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`font-bold transition-colors ${
              darkMode ? 'text-white hover:text-blue-400' : 'text-black hover:text-blue-600'
            }`}
          >
            Azan
          </a>
        </div>

        <div className="flex items-center gap-6">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className={`transition-all duration-300 transform hover:scale-110 ${
                darkMode ? 'hover:text-white' : 'hover:text-black'
              }`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
