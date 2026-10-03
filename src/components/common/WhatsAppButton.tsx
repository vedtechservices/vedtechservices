import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "917858971869"; // Primary WhatsApp number
  const message = "Hello VedTech Services, I need IT support.";
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 group animate-bounce"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
      </span>
    </button>
  );
};

export default WhatsAppButton;
