import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditSession } from '../../types';
import { shareToGallery } from '../../services/editSessionService';
import Button from '../ui/Button';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session: EditSession = location.state.session;

  if (!session) {
    // Redirect to home if no session is found
    navigate('/');
    return null;
  }

  const handleRegenerate = () => {
    // Go back to the edit page with the same session settings
    navigate('/edit', { state: { session } });
  };

  const handleShare = async () => {
    const confirmation = window.confirm("Are you sure you want to share this image to the public gallery?");
    if (confirmation) {
      try {
        await shareToGallery(session);
        alert("Image shared successfully!");
        navigate('/'); // Navigate to gallery after sharing
      } catch (error) {
        console.error("Failed to share image:", error);
        alert("There was an error sharing your image.");
      }
    }
  };

  const handleDownload = () => {
    if (session.outputImageUrl) {
      // This is a simple download trigger. A more robust solution might be needed for cross-origin images.
      const link = document.createElement('a');
      link.href = session.outputImageUrl;
      link.download = `generation-${session.sessionId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4 text-center text-white">
      <h1 className="text-3xl font-bold mb-6">Generation Complete</h1>
      
      {session.status === 'SUCCEEDED' && session.outputImageUrl ? (
        <div className="flex flex-col items-center">
          <img 
            src={session.outputImageUrl} 
            alt="Generated artwork" 
            className="max-w-full md:max-w-lg rounded-lg shadow-lg mb-6"
          />
          <div className="flex space-x-4">
            <Button onClick={handleDownload} variant="primary">Download</Button>
            <Button onClick={handleRegenerate} variant="secondary">Regenerate</Button>
            <Button onClick={handleShare} variant="success">Share</Button>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-lg bg-red-900 border border-red-700">
            <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
            <p>Something went wrong. Please try again.</p>
            <Button onClick={handleRegenerate} className="mt-4">Go Back</Button>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
