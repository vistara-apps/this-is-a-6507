import React, { useState } from 'react';
import { Upload, Music, Search, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import apiService from '../services/api.js';

export function SampleIdentification({ onProjectCreate, projects }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('audio/')) {
      setUploadedFile(file);
      setProjectName(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
      setError(null);
    } else {
      setError('Please upload an audio file (MP3, WAV, M4A, AAC)');
    }
  };

  const analyzeAudio = async () => {
    if (!uploadedFile || !projectName.trim()) {
      setError('Please provide a project name and upload an audio file');
      return;
    }

    if (!apiService.isAuthenticated()) {
      setError('Please log in to analyze audio files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audioFile', uploadedFile);
      formData.append('projectName', projectName.trim());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create project with audio upload
      const response = await apiService.createProject(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Poll for analysis results
      const pollForResults = async (projectId, attempts = 0) => {
        if (attempts > 30) { // Max 30 attempts (30 seconds)
          throw new Error('Analysis timeout - please try again');
        }

        try {
          const analysisResponse = await apiService.getProjectAnalysis(projectId);
          
          if (analysisResponse.analysisComplete) {
            setAnalysisResults({
              ...response.project,
              samples: analysisResponse.samples,
              detectionResults: analysisResponse.detectionResults
            });
            setIsAnalyzing(false);
            
            // Add to projects list
            if (onProjectCreate) {
              onProjectCreate(prev => [...prev, response.project]);
            }
          } else {
            // Continue polling
            setTimeout(() => pollForResults(projectId, attempts + 1), 1000);
          }
        } catch (error) {
          console.error('Polling error:', error);
          setTimeout(() => pollForResults(projectId, attempts + 1), 2000);
        }
      };

      // Start polling for results
      setTimeout(() => pollForResults(response.project.projectId), 2000);

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'uncleared':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Sample Identification & Source Finder</h1>
        <p className="text-xl text-white text-opacity-80">
          Upload your audio to identify samples and find copyright holders
        </p>
      </div>

