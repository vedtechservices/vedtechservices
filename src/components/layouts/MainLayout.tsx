import React from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import ChatBot from '@/components/common/ChatBot';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatBot />
    </div>
  );
};

export default MainLayout;
