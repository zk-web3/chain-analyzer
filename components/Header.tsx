import React from 'react';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  return (
    <header className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            L1 Chain Analyzer
          </h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header; 