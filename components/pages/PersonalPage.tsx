'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import { fetchUserPrompts, deletePrompt, updatePrompt, UserPrompt, fetchUserSharedImages, ImageAsset } from '../../services/promptService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import SharedImageCard from './SharedImageCard';

// Status badge colors
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface PromptCardProps {
  prompt: UserPrompt;
  onDelete: (promptId: string) => void;
  onTogglePublic: (promptId: string, isPublic: boolean) => void;
  onUse: (prompt: UserPrompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onTogglePublic, onUse }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    setIsDeleting(true);
    try {
      await onDelete(prompt.promptId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsToggling(true);
    try {
      await onTogglePublic(prompt.promptId, !prompt.isPublic);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-brand-accent/50 transition-all duration-300 group">
      {/* Preview Image */}
      <div className="relative h-48 bg-slate-900/50 overflow-hidden">
        {prompt.previewImageUrl ? (
          <img
            src={prompt.previewImageUrl}
            alt={prompt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[prompt.status]}`}>
          {prompt.status}
        </div>

        {/* Public/Private Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border ${prompt.isPublic ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
          {prompt.isPublic ? '🌐 Public' : '🔒 Private'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate mb-2">{prompt.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{prompt.content}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{prompt.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{prompt.timesUsed} uses</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUse(prompt)}
            className="flex-1"
          >
            Use Prompt
          </Button>
          <button
            onClick={handleTogglePublic}
            disabled={isToggling}
            className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-gray-300 transition disabled:opacity-50"
            title={prompt.isPublic ? 'Make Private' : 'Make Public'}
          >
            {isToggling ? (
              <Spinner />
            ) : prompt.isPublic ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? (
              <Spinner />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PersonalPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ userId: string; username: string; email: string } | null>(null);
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [sharedImages, setSharedImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadUserData(currentUser.userId);
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const promptsResponse = await fetchUserPrompts(userId);
      setPrompts(promptsResponse.prompts);
      const sharedImagesResponse = await fetchUserSharedImages(userId);
      setSharedImages(sharedImagesResponse);
    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError(err.message || 'Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await deletePrompt(promptId);
      setPrompts((prev) => prev.filter((p) => p.promptId !== promptId));
    } catch (err: any) {
      console.error('Failed to delete prompt:', err);
      alert(err.message || 'Failed to delete prompt');
    }
  };

  const handleTogglePublic = async (promptId: string, isPublic: boolean) => {
    try {
      const updated = await updatePrompt(promptId, { isPublic });
      setPrompts((prev) =>
        prev.map((p) =>
          p.promptId === promptId
            ? { ...p, isPublic: updated.isPublic, status: updated.status }
            : p
        )
      );
    } catch (err: any) {
      console.error('Failed to update prompt:', err);
      alert(err.message || 'Failed to update prompt');
    }
  };

  const handleUsePrompt = (prompt: UserPrompt) => {
    // Navigate to edit session with the prompt pre-filled
    navigate('/edit', {
      state: {
        session: {
          prompt: prompt.content,
          inputImageUrl: prompt.previewImageUrl,
        },
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredPrompts = prompts.filter((p) => {
    if (filter === 'public' && !p.isPublic) return false;
    if (filter === 'private' && p.isPublic) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: prompts.length,
    public: prompts.filter((p) => p.isPublic).length,
    private: prompts.filter((p) => !p.isPublic).length,
    totalLikes: prompts.reduce((sum, p) => sum + p.likesCount, 0),
    totalUses: prompts.reduce((sum, p) => sum + p.timesUsed, 0),
    sharedCreations: sharedImages.length,
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-accent to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-accent/25">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                <p className="text-gray-400 mt-1">{user.email}</p>
                <p className="text-sm text-brand-accent mt-2">Image Edit for everyone, edit like a pro.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => navigate('/edit')}>
                + Create New
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Total Prompts</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-purple-400">{stats.sharedCreations}</p>
              <p className="text-sm text-gray-400">Shared Creations</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-blue-400">{stats.public}</p>
              <p className="text-sm text-gray-400">Public</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-gray-400">{stats.private}</p>
              <p className="text-sm text-gray-400">Private</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-red-400">{stats.totalLikes}</p>
              <p className="text-sm text-gray-400">Total Likes</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-2xl font-bold text-green-400">{stats.totalUses}</p>
              <p className="text-sm text-gray-400">Total Uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-brand-accent text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'public'
                  ? 'bg-brand-accent text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              Public ({stats.public})
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'private'
                  ? 'bg-brand-accent text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              Private ({stats.private})
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-gray-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400">Loading your prompts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center max-w-md">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400">{error}</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => user && loadUserPrompts(user.userId)}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="w-20 h-20 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No prompts found</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {prompts.length === 0
                ? "You haven't created any prompts yet. Start creating to build your collection!"
                : 'No prompts match your current filters.'}
            </p>
            {prompts.length === 0 && (
              <Button variant="primary" onClick={() => navigate('/edit')}>
                Create Your First Prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.promptId}
                prompt={prompt}
                onDelete={handleDeletePrompt}
                onTogglePublic={handleTogglePublic}
                onUse={handleUsePrompt}
              />
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-4 mt-8">My Shared Creations</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400">Loading your creations...</p>
          </div>
        ) : sharedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400">You haven't shared any creations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sharedImages.map((image) => (
              <SharedImageCard
                key={image.id}
                image={image}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Idit</span>
              <span className="text-sm text-gray-500">Image Edit for everyone</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Idit. Edit like a pro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PersonalPage;