import React, { useState } from 'react';
import { Upload, Music, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function SampleIdentification({ onProjectCreate, projects }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
    } else {
      alert('Please upload an audio file');
    }
  };

  const analyzeAudio = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    
    // Simulate audio analysis with mock data
    setTimeout(() => {
      const mockResults = {
        projectId: Date.now().toString(),
        projectName: uploadedFile.name,
        audioFileUrl: URL.createObjectURL(uploadedFile),
        detectionResults: [
          {
            sampleId: '1',
            identifiedSampleName: 'Break My Soul - Beyoncé',
            copyrightHolder: 'Parkwood Entertainment',
            licensingStatus: 'uncleared',
            confidence: 95,
            startTime: '0:45',
            duration: '3.2s'
          },
          {
            sampleId: '2',
            identifiedSampleName: 'Funky Drummer - James Brown',
            copyrightHolder: 'Universal Music Group',
            licensingStatus: 'pending',
            confidence: 88,
            startTime: '1:23',
            duration: '2.1s'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAnalysisResults(mockResults);
      setIsAnalyzing(false);

      // Add to projects
      onProjectCreate(prev => [...prev, mockResults]);
    }, 3000);
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

      {/* File Upload */}
      <div className="glass-effect rounded-lg p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-accent bg-accent bg-opacity-10' 
              : 'border-white border-opacity-30 hover:border-accent'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto text-white mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            {uploadedFile ? uploadedFile.name : 'Drop your audio file here'}
          </h3>
          <p className="text-white text-opacity-70 mb-4">
            Or click to browse (MP3, WAV, FLAC supported)
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="inline-block bg-accent text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors"
          >
            Browse Files
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-4 flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Music className="text-white" size={24} />
              <div>
                <p className="text-white font-medium">{uploadedFile.name}</p>
                <p className="text-white text-opacity-70 text-sm">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search size={16} />
                  <span>Analyze Audio</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Analysis Results</h2>
          <div className="space-y-4">
            {analysisResults.detectionResults.map((sample) => (
              <div key={sample.sampleId} className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{sample.identifiedSampleName}</h3>
                    <p className="text-white text-opacity-70">{sample.copyrightHolder}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(sample.licensingStatus)}
                    <span className="text-white text-sm capitalize">{sample.licensingStatus}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white text-opacity-70">Confidence</span>
                    <p className="text-white font-medium">{sample.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-white text-opacity-70">Start Time</span>
                    <p className="text-white font-medium">{sample.startTime}</p>
                  </div>
                  <div>
                    <span className="text-white text-opacity-70">Duration</span>
                    <p className="text-white font-medium">{sample.duration}</p>
                  </div>
                  <div>
                    <button className="bg-accent text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors">
                      Start License
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <Music className="text-white" size={20} />
                  <div>
                    <p className="text-white font-medium">{project.projectName}</p>
                    <p className="text-white text-opacity-70 text-sm">
                      {project.detectionResults?.length || 0} samples detected
                    </p>
                  </div>
                </div>
                <span className="text-white text-opacity-70 text-sm">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}