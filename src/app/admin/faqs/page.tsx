"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// Default FAQs that match the original implementation
const defaultFAQs = [
  {
    id: '1',
    question: 'How do I create my first image?',
    answer: 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'
  },
  {
    id: '2',
    question: 'What file formats are supported?',
    answer: 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images with clear product visibility.'
  },
  {
    id: '3',
    question: 'How many credits do I need per image?',
    answer: 'Each image generation uses 1 credit. The number of credits you have depends on your subscription plan.'
  },
  {
    id: '4',
    question: 'Can I upgrade my plan?',
    answer: 'Yes! You can upgrade your plan at any time from the dashboard by clicking on "Upgrade" in the top right corner.'
  },
  {
    id: '5',
    question: 'How do I download my images?',
    answer: 'Your generated images will appear in your dashboard. Click on any image and use the download button to save it to your device.'
  },
  {
    id: '6',
    question: 'What if I run out of credits?',
    answer: 'You can purchase additional credits or upgrade your plan to get more credits. Visit the dashboard and click on "Get More Credits".'
  }
];

// FAQ interface
interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

export default function FAQsManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [isEditingFAQ, setIsEditingFAQ] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  // Use default FAQs data instead of fetching from Supabase
  async function fetchFAQs() {
    setIsLoading(true);
    try {
      console.log('Using default FAQs data');
      setFaqs(defaultFAQs);
    } catch (error) {
      console.error("Unexpected error setting FAQs:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // Add a new FAQ to local state
  async function handleAddFAQ() {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Please provide both a question and an answer");
      return;
    }

    setIsAddingFAQ(true);
    try {
      // Generate a unique ID for the new FAQ
      const newId = (Math.max(...faqs.map(faq => parseInt(faq.id)), 0) + 1).toString();
      
      // Create the new FAQ object
      const newFAQ = {
        id: newId,
        question: newQuestion,
        answer: newAnswer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add the new FAQ to the state
      setFaqs([newFAQ, ...faqs]);
      
      toast.success("FAQ added successfully");
      setNewQuestion("");
      setNewAnswer("");
    } catch (error) {
      console.error("Unexpected error adding FAQ:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAddingFAQ(false);
    }
  }

  // Delete a FAQ from local state
  async function handleDeleteFAQ(id: string) {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      // Filter out the FAQ with the given ID
      const updatedFaqs = faqs.filter(faq => faq.id !== id);
      setFaqs(updatedFaqs);
      toast.success("FAQ deleted successfully");
    } catch (error) {
      console.error("Unexpected error deleting FAQ:", error);
      toast.error("An unexpected error occurred");
    }
  }

  // Start editing a FAQ
  function startEditFAQ(faq: FAQ) {
    setEditingFAQ(faq);
    setNewQuestion(faq.question);
    setNewAnswer(faq.answer);
    setIsEditingFAQ(true);
  }

  // Cancel editing
  function cancelEdit() {
    setIsEditingFAQ(false);
    setEditingFAQ(null);
    setNewQuestion("");
    setNewAnswer("");
  }

  // Update a FAQ in local state
  async function handleUpdateFAQ() {
    if (!editingFAQ) return;
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Please provide both a question and an answer");
      return;
    }

    try {
      // Update the FAQ in the local state
      const updatedFaqs = faqs.map(faq => {
        if (faq.id === editingFAQ.id) {
          return {
            ...faq,
            question: newQuestion,
            answer: newAnswer,
            updated_at: new Date().toISOString()
          };
        }
        return faq;
      });
      
      setFaqs(updatedFaqs);
      toast.success("FAQ updated successfully");
      cancelEdit();
    } catch (error) {
      console.error("Unexpected error updating FAQ:", error);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQ Management</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="text-blue-500 hover:underline">
            Back to Admin Dashboard
          </Link>
          <Link href="/" className="text-blue-500 hover:underline ml-4">
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* Add/Edit FAQ Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">{isEditingFAQ ? "Edit FAQ" : "Add New FAQ"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter FAQ question"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-32"
              placeholder="Enter FAQ answer"
            />
          </div>
          <div className="flex gap-2">
            {isEditingFAQ ? (
              <>
                <button
                  onClick={handleUpdateFAQ}
                  disabled={isAddingFAQ}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Update FAQ
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
                onClick={handleAddFAQ}
                disabled={isAddingFAQ}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add FAQ
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* FAQ List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Existing FAQs</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading FAQs...</p>
        ) : faqs.length === 0 ? (
          <p className="text-gray-600">No FAQs found. Add your first FAQ above.</p>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditFAQ(faq)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
