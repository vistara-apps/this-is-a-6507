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

        {/* Project Name Input */}
        {uploadedFile && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-white font-medium mb-2">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter a name for your project"
                className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent"
              />
            </div>
            
            <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
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
                disabled={isAnalyzing || !projectName.trim()}
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

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isAnalyzing && uploadProgress > 0 && (
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">
                {uploadProgress < 100 ? 'Uploading...' : 'Analyzing audio...'}
              </span>
              <span className="text-white text-opacity-70">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {uploadProgress >= 100 && (
              <div className="flex items-center space-x-2 mt-2 text-white text-opacity-70">
                <RefreshCw className="animate-spin" size={16} />
                <span className="text-sm">Processing audio and identifying samples...</span>
              </div>
            )}
          </div>
        )}
      </div>
