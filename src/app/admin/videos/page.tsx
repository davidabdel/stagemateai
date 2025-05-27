"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// Default video tutorials in case database fetch fails
const defaultVideoTutorials = [
  {
    id: '1',
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'jO0ILN23L-g',
    thumbnail: 'https://i.ytimg.com/vi/jO0ILN23L-g/mqdefault.jpg'
  },
  {
    id: '2',
    title: 'Dont List an Empty Home',
    description: 'Turn your empty home into a staged home with StageMate AI.',
    videoId: 's_ZeJZx4_n8',
    thumbnail: 'https://i.ytimg.com/vi/s_ZeJZx4_n8/mqdefault.jpg'
  }
];

// Video interface
interface Video {
  id: string;
  title: string;
  description: string;
  videoId: string;
  thumbnail: string;
  created_at?: string;
  updated_at?: string;
}

export default function VideosManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVideoId, setNewVideoId] = useState("");
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [previewVideoId, setPreviewVideoId] = useState("");

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Use default videos data instead of fetching from Supabase
  async function fetchVideos() {
    setIsLoading(true);
    try {
      console.log('Using default videos data');
      setVideos(defaultVideoTutorials);
    } catch (error) {
      console.error("Unexpected error setting videos:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // Add a new video to local state
  async function handleAddVideo() {
    if (!newTitle.trim() || !newVideoId.trim()) {
      toast.error("Please provide both a title and a YouTube video ID");
      return;
    }

    setIsAddingVideo(true);
    try {
      // Generate a unique ID for the new video
      const newId = (Math.max(...videos.map(video => parseInt(video.id)), 0) + 1).toString();
      
      // Generate thumbnail URL from YouTube video ID
      const thumbnail = `https://i.ytimg.com/vi/${newVideoId}/mqdefault.jpg`;
      
      // Create the new video object
      const newVideo = {
        id: newId,
        title: newTitle,
        description: newDescription,
        videoId: newVideoId,
        thumbnail: thumbnail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add the new video to the state
      setVideos([newVideo, ...videos]);
      
      toast.success("Video added successfully");
      setNewTitle("");
      setNewDescription("");
      setNewVideoId("");
    } catch (error) {
      console.error("Unexpected error adding video:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAddingVideo(false);
    }
  }

  // Delete a video from local state
  async function handleDeleteVideo(id: string) {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      // Filter out the video with the given ID
      const updatedVideos = videos.filter(video => video.id !== id);
      setVideos(updatedVideos);
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Unexpected error deleting video:", error);
      toast.error("An unexpected error occurred");
    }
  }

  // Start editing a video
  function startEditVideo(video: Video) {
    setEditingVideo(video);
    setNewTitle(video.title);
    setNewDescription(video.description || "");
    setNewVideoId(video.videoId);
    setIsEditingVideo(true);
  }

  // Cancel editing
  function cancelEdit() {
    setIsEditingVideo(false);
    setEditingVideo(null);
    setNewTitle("");
    setNewDescription("");
    setNewVideoId("");
  }

  // Update a video in local state
  async function handleUpdateVideo() {
    if (!editingVideo) return;
    if (!newTitle.trim() || !newVideoId.trim()) {
      toast.error("Please provide both a title and a YouTube video ID");
      return;
    }

    try {
      const thumbnail = `https://i.ytimg.com/vi/${newVideoId}/mqdefault.jpg`;
      
      // Update the video in the local state
      const updatedVideos = videos.map(video => {
        if (video.id === editingVideo.id) {
          return {
            ...video,
            title: newTitle,
            description: newDescription,
            videoId: newVideoId,
            thumbnail: thumbnail,
            updated_at: new Date().toISOString()
          };
        }
        return video;
      });
      
      setVideos(updatedVideos);
      toast.success("Video updated successfully");
      cancelEdit();
    } catch (error) {
      console.error("Unexpected error updating video:", error);
      toast.error("An unexpected error occurred");
    }
  }

  // Preview a video
  function handlePreviewVideo(videoId: string) {
    setPreviewVideoId(videoId);
  }

  // Close preview
  function closePreview() {
    setPreviewVideoId("");
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="text-blue-500 hover:underline">
            Back to Admin Dashboard
          </Link>
          <Link href="/" className="text-blue-500 hover:underline ml-4">
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* Add/Edit Video Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">{isEditingVideo ? "Edit Video" : "Add New Video"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter video title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-24"
              placeholder="Enter video description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVideoId}
                onChange={(e) => setNewVideoId(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
                placeholder="e.g. dQw4w9WgXcQ"
              />
              {newVideoId && (
                <button
                  onClick={() => handlePreviewVideo(newVideoId)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Preview
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The video ID is the part after "v=" in a YouTube URL. For example, in https://www.youtube.com/watch?v=dQw4w9WgXcQ, the ID is dQw4w9WgXcQ.
            </p>
          </div>
          <div className="flex gap-2">
            {isEditingVideo ? (
              <>
                <button
                  onClick={handleUpdateVideo}
                  disabled={isAddingVideo}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Update Video
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleAddVideo}
                disabled={isAddingVideo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add Video
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Video Preview Modal */}
      {previewVideoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Video Preview</h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="relative pb-[56.25%] h-0 overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Video List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Existing Videos</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-600">No videos found. Add your first video above.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="border rounded overflow-hidden bg-gray-50">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-200">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handlePreviewVideo(video.videoId)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                  >
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditVideo(video)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handlePreviewVideo(video.videoId)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm ml-auto"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
