import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import ImageGalleryPage from './components/pages/ImageGalleryPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import EditSessionPage from './components/pages/EditSessionPage';
import GeneratingPage from './components/pages/GeneratingPage';
import ResultPage from './components/pages/ResultPage';
import PersonalPage from './components/pages/PersonalPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-primary">
        <Routes>
          {/* Personal page has its own header/layout */}
          <Route path="/profile" element={<PersonalPage />} />
          <Route path="/my-prompts" element={<PersonalPage />} />
          
          {/* Routes with shared header */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<ImageGalleryPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/edit" element={<EditSessionPage />} />
                    <Route path="/generating" element={<GeneratingPage />} />
                    <Route path="/result" element={<ResultPage />} />
                  </Routes>
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
