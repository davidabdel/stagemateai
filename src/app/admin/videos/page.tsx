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
  function previewVideo(videoId: string) {
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
              className="w-full p-2 border border-gray-300 rounded-md"
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
              className="w-full p-2 border border-gray-300 rounded-md h-20"
              placeholder="Enter video description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video ID
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={newVideoId}
                onChange={(e) => setNewVideoId(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="e.g. jO0ILN23L-g (from YouTube URL)"
              />
              {newVideoId && (
                <button
                  onClick={() => previewVideo(newVideoId)}
                  className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Preview
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The video ID is the part after "v=" in a YouTube URL. For example, in https://www.youtube.com/watch?v=jO0ILN23L-g, the ID is "jO0ILN23L-g".
            </p>
          </div>
          <div className="flex gap-2">
            {isEditingVideo ? (
              <>
                <button
                  onClick={handleUpdateVideo}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isAddingVideo}
                >
                  Update Video
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleAddVideo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isAddingVideo}
              >
                {isAddingVideo ? "Adding..." : "Add Video"}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Video Preview Modal */}
      {previewVideoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Video Preview</h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-96"
              ></iframe>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Video List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Existing Videos</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <p className="text-gray-500 py-4">No videos found. Add your first video above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="relative pb-[56.25%] cursor-pointer" onClick={() => previewVideo(video.videoId)}>
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => startEditVideo(video)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
