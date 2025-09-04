import React, { useState } from 'react';
import { FileText, Download, AlertTriangle, CheckCircle, Upload, MessageSquare } from 'lucide-react';

export function DMCAToolkit() {
  const [selectedTemplate, setSelectedTemplate] = useState('counter-notice');
  const [formData, setFormData] = useState({
    artistName: '',
    contactInfo: '',
    trackTitle: '',
    platform: '',
    takedownDetails: '',
    fairUseJustification: '',
    licenseInfo: ''
  });
  const [uploadedNotice, setUploadedNotice] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState('');

  const templates = {
    'counter-notice': {
      title: 'DMCA Counter-Notice',
      description: 'Respond to a takedown notice when you believe the claim is invalid',
      fields: ['artistName', 'contactInfo', 'trackTitle', 'platform', 'takedownDetails', 'fairUseJustification']
    },
    'license-proof': {
      title: 'License Documentation Response',
      description: 'Provide proof of valid licensing for disputed samples',
      fields: ['artistName', 'contactInfo', 'trackTitle', 'platform', 'licenseInfo']
    },
    'fair-use': {
      title: 'Fair Use Defense',
      description: 'Assert fair use rights for transformative or educational content',
      fields: ['artistName', 'contactInfo', 'trackTitle', 'platform', 'fairUseJustification']
    }
  };

  const generateResponse = () => {
    const template = templates[selectedTemplate];
    let response = '';

    switch (selectedTemplate) {
      case 'counter-notice':
        response = `DMCA Counter-Notice

To: ${formData.platform || '[Platform Name]'}
From: ${formData.artistName || '[Your Name]'}
Date: ${new Date().toLocaleDateString()}

I, ${formData.artistName || '[Your Name]'}, hereby submit this counter-notice pursuant to 17 U.S.C. § 512(g)(3).

IDENTIFICATION OF DISPUTED MATERIAL:
The material that was removed or disabled: "${formData.trackTitle || '[Track Title]'}"

STATEMENT OF GOOD FAITH BELIEF:
I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification. The takedown notice appears to be based on ${formData.takedownDetails || '[describe the error/misidentification]'}.

FAIR USE JUSTIFICATION:
${formData.fairUseJustification || '[Explain how your use constitutes fair use or is otherwise legally permissible]'}

CONSENT TO JURISDICTION:
I consent to the jurisdiction of the Federal District Court for the judicial district in which my address is located, and I will accept service of process from the person who provided the original DMCA notice.

STATEMENT UNDER PENALTY OF PERJURY:
I swear, under penalty of perjury, that I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.

Contact Information:
${formData.contactInfo || '[Your contact information]'}

Signature: ${formData.artistName || '[Your Name]'}
Date: ${new Date().toLocaleDateString()}`;
        break;

      case 'license-proof':
        response = `Response to DMCA Takedown Notice - License Documentation

To: ${formData.platform || '[Platform Name]'}
From: ${formData.artistName || '[Your Name]'}
Date: ${new Date().toLocaleDateString()}

RE: Disputed Content - "${formData.trackTitle || '[Track Title]'}"

I am writing to contest the DMCA takedown notice filed against my content. I have valid licensing for all samples used in this work.

License Documentation:
${formData.licenseInfo || '[Detail your licensing agreements, reference numbers, and rights obtained]'}

The content in question is legally compliant and properly licensed. I request immediate restoration of the disputed material.

Contact Information:
${formData.contactInfo || '[Your contact information]'}

Sincerely,
${formData.artistName || '[Your Name]'}`;
        break;

      case 'fair-use':
        response = `Fair Use Defense - DMCA Response

To: ${formData.platform || '[Platform Name]'}
From: ${formData.artistName || '[Your Name]'}
Date: ${new Date().toLocaleDateString()}

RE: Fair Use Defense for "${formData.trackTitle || '[Track Title]'}"

I contest the DMCA takedown notice on the grounds of fair use under 17 U.S.C. § 107.

Fair Use Analysis:
${formData.fairUseJustification || '[Explain how your use meets fair use criteria: purpose, nature, amount used, effect on market]'}

This use constitutes transformative fair use and does not infringe copyright. I request restoration of the content.

Contact Information:
${formData.contactInfo || '[Your contact information]'}

Respectfully,
${formData.artistName || '[Your Name]'}`;
        break;
    }

    setGeneratedResponse(response);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNoticeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedNotice(file);
    }
  };

  const downloadResponse = () => {
    const blob = new Blob([generatedResponse], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-response.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">DMCA Response Toolkit</h1>
        <p className="text-xl text-white text-opacity-80">
          Tools and templates to respond effectively to DMCA takedown notices
        </p>
      </div>

      {/* Template Selection */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Response Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedTemplate === key
                  ? 'border-accent bg-accent bg-opacity-20'
                  : 'border-white border-opacity-30 hover:border-accent hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <h3 className="font-semibold text-white mb-2">{template.title}</h3>
              <p className="text-white text-opacity-70 text-sm">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Takedown Notice */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Upload Takedown Notice (Optional)</h2>
        <div className="border-2 border-dashed border-white border-opacity-30 rounded-lg p-6 text-center">
          <Upload className="mx-auto text-white mb-3" size={32} />
          <p className="text-white text-opacity-70 mb-3">
            Upload the DMCA notice to help us analyze and suggest the best response
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleNoticeUpload}
            className="hidden"
            id="notice-upload"
          />
          <label
            htmlFor="notice-upload"
            className="inline-block bg-accent text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors"
          >
            Choose File
          </label>
          {uploadedNotice && (
            <p className="text-white mt-2">Uploaded: {uploadedNotice.name}</p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Response Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates[selectedTemplate].fields.includes('artistName') && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Your Name/Artist Name</label>
              <input
                type="text"
                value={formData.artistName}
                onChange={(e) => handleInputChange('artistName', e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
                placeholder="Enter your name or artist name"
              />
            </div>
          )}

          {templates[selectedTemplate].fields.includes('contactInfo') && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Contact Information</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
                placeholder="Email, phone, address"
              />
            </div>
          )}

          {templates[selectedTemplate].fields.includes('trackTitle') && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Track Title</label>
              <input
                type="text"
                value={formData.trackTitle}
                onChange={(e) => handleInputChange('trackTitle', e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
                placeholder="Title of the disputed content"
              />
            </div>
          )}

          {templates[selectedTemplate].fields.includes('platform') && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="text-black">Select platform...</option>
                <option value="YouTube" className="text-black">YouTube</option>
                <option value="SoundCloud" className="text-black">SoundCloud</option>
                <option value="Spotify" className="text-black">Spotify</option>
                <option value="Instagram" className="text-black">Instagram</option>
                <option value="TikTok" className="text-black">TikTok</option>
                <option value="Other" className="text-black">Other</option>
              </select>
            </div>
          )}
        </div>

        {templates[selectedTemplate].fields.includes('takedownDetails') && (
          <div className="mt-4">
            <label className="block text-white text-sm font-medium mb-2">Takedown Details</label>
            <textarea
              value={formData.takedownDetails}
              onChange={(e) => handleInputChange('takedownDetails', e.target.value)}
              className="w-full h-24 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
              placeholder="Describe the nature of the takedown and why you believe it's incorrect"
            />
          </div>
        )}

        {templates[selectedTemplate].fields.includes('fairUseJustification') && (
          <div className="mt-4">
            <label className="block text-white text-sm font-medium mb-2">Fair Use Justification</label>
            <textarea
              value={formData.fairUseJustification}
              onChange={(e) => handleInputChange('fairUseJustification', e.target.value)}
              className="w-full h-32 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
              placeholder="Explain how your use constitutes fair use (transformative nature, educational purpose, minimal use, no market harm)"
            />
          </div>
        )}

        {templates[selectedTemplate].fields.includes('licenseInfo') && (
          <div className="mt-4">
            <label className="block text-white text-sm font-medium mb-2">License Information</label>
            <textarea
              value={formData.licenseInfo}
              onChange={(e) => handleInputChange('licenseInfo', e.target.value)}
              className="w-full h-24 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
              placeholder="Provide details about your licensing agreements, reference numbers, and rights obtained"
            />
          </div>
        )}

        <button
          onClick={generateResponse}
          className="mt-4 bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          Generate Response
        </button>
      </div>

      {/* Generated Response */}
      {generatedResponse && (
        <div className="glass-effect rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Generated Response</h2>
            <button
              onClick={downloadResponse}
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <pre className="text-white text-sm whitespace-pre-wrap font-mono">
              {generatedResponse}
            </pre>
          </div>

          <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-semibold">Legal Disclaimer</span>
            </div>
            <p className="text-white text-opacity-90 mt-2 text-sm">
              This is a template for educational purposes. Please review with a qualified attorney 
              before submitting any legal response. Laws vary by jurisdiction and individual circumstances.
            </p>
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Understanding Fair Use</h3>
            <p className="text-white text-opacity-70 text-sm mb-3">
              Learn about the four factors courts consider when evaluating fair use claims.
            </p>
            <button className="text-accent hover:text-opacity-80 text-sm font-medium">
              Read Guide →
            </button>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">DMCA Process Timeline</h3>
            <p className="text-white text-opacity-70 text-sm mb-3">
              Understand the typical timeline and steps in the DMCA process.
            </p>
            <button className="text-accent hover:text-opacity-80 text-sm font-medium">
              View Timeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}