import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { EditSession } from '../../types';
import { polishPrompt, generateImage } from '../../services/editSessionService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const samplerOptions = ["Euler a", "DPM++", "LMS", "DDIM"];
const modelOptions = ["Stable-Diffusion-v1-5", "DALL-E-2", "Midjourney-v4"];

const EditSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<EditSession>(() => {
    // Initialize from location state (e.g., from "reuse prompt") or with defaults
    const initialState = location.state?.session || {
      sessionId: uuidv4(),
      prompt: '',
      modelName: modelOptions[0],
      cfgScale: 7.5,
      steps: 20,
      sampler: samplerOptions[0],
      strength: 0.8,
      seed: Math.floor(Math.random() * 100000),
      status: 'CREATED',
    };
    return initialState;
  });
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSession(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSession(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSession(prev => ({ ...prev, inputImageUrl: URL.createObjectURL(file) }));
    }
  };

  const handlePolishPrompt = async () => {
    if (!session.prompt) return;
    setIsPolishing(true);
    try {
      const polished = await polishPrompt(session.prompt);
      setSession(prev => ({ ...prev, prompt: polished }));
    } catch (error) {
      console.error("Failed to polish prompt:", error);
      // Optionally, show an error to the user
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Navigate to the generating page, passing the session state
    navigate('/generating', { state: { session } });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl text-white">
      <h1 className="text-3xl font-bold mb-6">Create New Generation</h1>
      
      {/* Image Upload */}
      <div className="mb-6 mx-auto w-full max-w-sm">
        <label htmlFor="image-upload" className="block text-lg font-medium mb-2 text-center">Upload Image (Required)</label>
        <div 
          className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-brand-accent transition-colors duration-200"
        >
          <input 
            type="file" 
            id="image-upload" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {session.inputImageUrl ? (
            <img src={session.inputImageUrl} alt="Input preview" className="max-h-full max-w-full object-contain rounded-lg" />
          ) : (
            <>
              {/* Placeholder for image icon - using a simple SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-400">Click to upload image</p>
            </>
          )}
        </div>
      </div>
      
      {/* Prompt Section */}
      <div className="mb-6">
        <label htmlFor="prompt" className="block text-lg font-medium mb-2">Your Prompt</label>
        <textarea
          id="prompt"
          name="prompt"
          value={session.prompt}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-brand-secondary border border-gray-600"
          rows={4}
          placeholder="e.g., a majestic lion in a futuristic city, photorealistic"
        />
        <div className="flex items-center justify-between mt-2">
            <Button onClick={handlePolishPrompt} disabled={isPolishing || !session.prompt}>
            {isPolishing ? <Spinner /> : '✨ Polish Prompt'}
            </Button>
        </div>
      </div>

      {/* Generation Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="modelName" className="block text-sm font-medium mb-1">Model</label>
          <select
            id="modelName"
            name="modelName"
            value={session.modelName}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-brand-secondary border border-gray-600"
          >
            {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sampler" className="block text-sm font-medium mb-1">Sampler</label>
          <select
            id="sampler"
            name="sampler"
            value={session.sampler}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-brand-secondary border border-gray-600"
          >
            {samplerOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Sliders */}
        <div>
            <label htmlFor="cfgScale" className="block text-sm font-medium">CFG Scale: {session.cfgScale}</label>
            <input type="range" id="cfgScale" name="cfgScale" min="1" max="20" step="0.5" value={session.cfgScale} onChange={handleSliderChange} className="w-full" />
        </div>
        <div>
            <label htmlFor="steps" className="block text-sm font-medium">Steps: {session.steps}</label>
            <input type="range" id="steps" name="steps" min="10" max="150" step="1" value={session.steps} onChange={handleSliderChange} className="w-full" />
        </div>
        <div>
            <label htmlFor="strength" className="block text-sm font-medium">Strength: {session.strength}</label>
            <input type="range" id="strength" name="strength" min="0" max="1" step="0.05" value={session.strength} onChange={handleSliderChange} className="w-full" />
        </div>
        <div>
            <label htmlFor="seed" className="block text-sm font-medium">Seed</label>
            <input type="number" id="seed" name="seed" value={session.seed} onChange={handleInputChange} className="w-full p-2 rounded bg-brand-secondary border border-gray-600" />
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button onClick={handleGenerate} disabled={isGenerating || !session.prompt || !selectedFile} size="lg">
          {isGenerating ? <Spinner /> : 'Generate Image'}
        </Button>
      </div>
    </div>
  );
};

export default EditSessionPage;
