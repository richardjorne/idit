import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditSession } from '../../types';
import { generateImage } from '../../services/editSessionService';

const GeneratingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<EditSession>(location.state.session);

  useEffect(() => {
    const runGeneration = async () => {
      try {
        const outputImageUrl = await generateImage(session);
        const finalSession: EditSession = {
          ...session,
          status: 'SUCCEEDED',
          outputImageUrl,
        };
        // Navigate to the result page with the completed session
        navigate('/result', { state: { session: finalSession }, replace: true });
      } catch (error) {
        console.error('Image generation failed:', error);
        const finalSession: EditSession = {
          ...session,
          status: 'FAILED',
        };
        // Navigate back to the edit page or show an error
        navigate('/edit', { state: { session: finalSession }, replace: true });
      }
    };

    runGeneration();
  }, [navigate, session]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-primary text-white">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-400"></div>
      <h1 className="text-2xl font-semibold mt-6">Generating your image...</h1>
      <p className="text-gray-400 mt-2">This may take a moment.</p>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-10 animate-gradient-x"></div>
    </div>
  );
};

// Add this animation to your global CSS or a style tag if not present
// For now, let's assume a global stylesheet or styled-components setup
// A simple way for this example: add to index.css or a relevant global style file.
/*
@keyframes gradient-x {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}
.animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 5s ease infinite;
}
*/

export default GeneratingPage;
