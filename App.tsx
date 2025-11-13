
import React from 'react';
import Header from './components/layout/Header';
import ImageGalleryPage from './components/pages/ImageGalleryPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-primary">
      <Header />
      <main>
        <ImageGalleryPage />
      </main>
    </div>
  );
};

export default App;
