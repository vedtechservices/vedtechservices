import React from 'react';
import { Link } from '@/lib/next-router';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/conv-99gjdx4fbuv4/20260302/file-9znj7azzuakg.png"
                alt="VedTech Services Logo"
                className="h-12 w-auto"
                data-editor-config="%7B%22defaultSrc%22%3A%22https%3A%2F%2Fmiaoda-conversation-file.s3cdn.medo.dev%2Fuser-8t7j0johoxds%2Fconv-99gjdx4fbuv4%2F20260302%2Ffile-9znj7azzuakg.png%22%7D" />
            </div>
            <h3 className="text-xl font-bold text-white">VedTech Services</h3>
            <p className="text-sm leading-relaxed">{"Your one-stop solution for all IT hardware, software, and technical support needs. \"One Call – All IT Problems Solved\" "}</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/in/ved-tech-services-0b04b03aa" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn Company Profile"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/why-us" className="hover:text-white transition-colors">Why Choose Us</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors text-primary font-semibold">Admin Portal</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/web-development" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/services/mobile-app-development" className="hover:text-white transition-colors">Mobile App Development</Link></li>
              <li><Link to="/services/hardware-repair" className="hover:text-white transition-colors">Hardware Repair</Link></li>
              <li><Link to="/services/networking-solutions" className="hover:text-white transition-colors">Networking Solutions</Link></li>
              <li><Link to="/services/it-support" className="hover:text-white transition-colors">IT Support & AMC</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>{"Visit us: Gurugram, Haryana — Sector 17A (Head Office) India "}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>{"  Samastipur, Bihar — 848101 , Bihar, India"}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>{"  Bhopal, Madhya Pradesh India"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>{"Call: +91 7858971869 "}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>{"Email: info@vedtechservices.in."}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-500 shrink-0" />
                <span>{"WhatsApp: +91 7858971869"}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 VedTech Services. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-white transition-colors underline decoration-slate-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors underline decoration-slate-700">Terms of Service</Link>
            <Link to="/employee/login" className="hover:text-white transition-colors underline decoration-slate-700">Employee Login</Link>
            <Link to="/admin/login" className="hover:text-white transition-colors underline decoration-slate-700">Admin Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
