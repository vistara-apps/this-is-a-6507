import React from 'react';
import { Upload, Music, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export function Dashboard({ projects, samples }) {
  const stats = [
    {
      title: 'Projects Scanned',
      value: projects.length,
      icon: Music,
      color: 'bg-blue-500',
    },
    {
      title: 'Samples Identified',
      value: samples.length,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Licenses',
      value: samples.filter(s => s.licensingStatus === 'pending').length,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Cleared Samples',
      value: samples.filter(s => s.licensingStatus === 'cleared').length,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          Clear sample rights and avoid DMCA takedowns
        </h1>
        <p className="text-xl text-white text-opacity-80 max-w-2xl mx-auto">
          AI-powered tools for remix artists to efficiently secure sample rights and detect uncleared samples
        </p>
      </div>

      {/* Quick Upload */}
      <div className="glass-effect rounded-lg p-6 text-center">
        <Upload className="mx-auto text-white mb-4" size={48} />
        <h2 className="text-2xl font-semibold text-white mb-2">Quick Sample Analysis</h2>
        <p className="text-white text-opacity-70 mb-4">
          Upload an audio file to identify samples and check licensing status
        </p>
        <button className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
          Upload Audio File
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-effect rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-70 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Projects</h3>
          {projects.length === 0 ? (
            <p className="text-white text-opacity-70">No projects yet. Start by uploading an audio file!</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div key={project.projectId} className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{project.projectName}</p>
                    <p className="text-white text-opacity-70 text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {project.detectionResults?.length || 0} samples
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-effect rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Licensing Status</h3>
          {samples.length === 0 ? (
            <p className="text-white text-opacity-70">No samples identified yet.</p>
          ) : (
            <div className="space-y-3">
              {samples.slice(0, 3).map((sample) => (
                <div key={sample.sampleId} className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{sample.identifiedSampleName}</p>
                    <p className="text-white text-opacity-70 text-sm">{sample.copyrightHolder}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    sample.licensingStatus === 'cleared' ? 'bg-green-500 text-white' :
                    sample.licensingStatus === 'pending' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {sample.licensingStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}