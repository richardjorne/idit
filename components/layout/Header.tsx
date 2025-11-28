'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-brand-secondary/50 backdrop-blur-lg sticky top-0 z-50 w-full border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span 
                className="text-2xl font-bold text-white cursor-pointer hover:text-brand-accent transition"
                onClick={() => navigate('/')}
              >
                Idit
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/edit')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-full text-lg transition duration-200"
              aria-label="Create new generation"
            >
              +
            </button>
            <button 
              id="loginButton" 
              onClick={() => navigate('/login')}
              className="bg-brand-accent hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;