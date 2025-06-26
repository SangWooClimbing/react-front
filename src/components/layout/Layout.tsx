
import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userId: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, userId }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogout={onLogout} userId={userId} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
