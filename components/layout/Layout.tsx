
import React from 'react';
import Header from './Header';
// import Footer from './Footer'; // Footer can be added later if needed

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
    