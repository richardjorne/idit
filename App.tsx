import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import ImageGalleryPage from './components/pages/ImageGalleryPage';
import LoginPage from './components/pages/LoginPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-primary">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<ImageGalleryPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;

