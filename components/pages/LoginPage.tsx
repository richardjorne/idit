'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //Authentication goes here
    console.log('Login attempt:', { email, password });

    //go back to home page
    navigate('/');
  };


  /* 
  I used AI to speed up the UI frontend design for the login page. I learned a lot about 
  the different labels and modifications you can make to labels, headings, etc. I verified it by
  running it and testing out my routing features with the new UI design.

  */

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Idit</h1>
          <p className="text-center text-gray-400 mb-6">Login to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-accent hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;