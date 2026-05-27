import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-border">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-gradient-accent">
          FinPilot AI
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-accent/80 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-accent/80 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Link href="/login" className="px-4 py-2 bg-transparent text-accent border border-accent rounded-lg hover:bg-accent/10 transition-colors">
          Sign In
        </Link>
        <Link href="/register" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;