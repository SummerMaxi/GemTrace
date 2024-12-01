import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { uploadFileToPinata, uploadJSONToPinata, getPinataUrl } from './utils/pinata';

function App() {
  const [gemImage, setGemImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    success: false,
    error: null,
    imageUrl: null,
    metadataUrl: null
  });
  const [gemData, setGemData] = useState({
    name: '',
    locality: '',
    weight: '',
    size: '',
    description: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGemImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus({ loading: true, success: false, error: null });
    
    try {
      if (!gemImage) {
        throw new Error('Please select an image first');
      }

      // Convert base64 image URL to File object
      const response = await fetch(gemImage);
      const blob = await response.blob();
      const imageFile = new File([blob], 'gem-image.jpg', { type: 'image/jpeg' });

      // Upload image to Pinata
      const imageUploadResult = await uploadFileToPinata(imageFile);
      const imageIpfsHash = imageUploadResult.IpfsHash;
      const imageUrl = getPinataUrl(imageIpfsHash);

      // Prepare and upload metadata
      const metadata = {
        ...gemData,
        imageIpfsHash,
        timestamp: new Date().toISOString()
      };

      const metadataUploadResult = await uploadJSONToPinata(metadata);
      const metadataUrl = getPinataUrl(metadataUploadResult.IpfsHash);

      setUploadStatus({
        loading: false,
        success: true,
        error: null,
        imageUrl,
        metadataUrl
      });

      // Reset form
      setGemImage(null);
      setGemData({
        name: '',
        locality: '',
        weight: '',
        size: '',
        description: ''
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        loading: false,
        success: false,
        error: error.message || 'Failed to upload to IPFS'
      });
    }
  };

  return (
    <div className="min-h-screen bg-bento-50 p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header with Connect Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              GemTrace
            </h1>
            <p className="text-bento-400 text-sm">Document Your Precious Stones</p>
          </div>
          
          {/* Wallet Connect Button */}
          <ConnectButton 
            chainStatus="icon"
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-square w-full bg-bento-50 rounded-xl overflow-hidden">
              {gemImage ? (
                <div className="relative h-full group">
                  <img
                    src={gemImage}
                    alt="Uploaded gem"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                    <button
                      onClick={() => setGemImage(null)}
                      className="bg-white/90 hover:bg-white text-bento-500 px-4 py-2 rounded-lg text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-bento-100 transition-colors duration-300">
                  <PhotoIcon className="w-12 h-12 text-bento-300 mb-2" />
                  <p className="text-sm font-medium text-bento-400">Drop image here</p>
                  <p className="text-xs text-bento-300">or click to upload</p>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              )}
            </div>
          </div>

          {/* Right Column - Form Inputs */}
          <div className="space-y-4">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-bento-400 mb-1">Mineral Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-bento-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    value={gemData.name}
                    onChange={(e) => setGemData({...gemData, name: e.target.value})}
                    placeholder="e.g., Ruby"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bento-400 mb-1">Locality</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-bento-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    value={gemData.locality}
                    onChange={(e) => setGemData({...gemData, locality: e.target.value})}
                    placeholder="e.g., Myanmar"
                  />
                </div>
              </div>
            </div>

            {/* Measurements Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-bento-400 mb-1">Weight (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-bento-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    value={gemData.weight}
                    onChange={(e) => setGemData({...gemData, weight: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bento-400 mb-1">Size (mm)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-bento-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    value={gemData.size}
                    onChange={(e) => setGemData({...gemData, size: e.target.value})}
                    placeholder="0×0×0"
                  />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              <label className="block text-sm font-medium text-bento-400 mb-1">Description</label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 text-sm rounded-lg border border-bento-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                value={gemData.description}
                onChange={(e) => setGemData({...gemData, description: e.target.value})}
                placeholder="Add details about your gem..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={uploadStatus.loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-2.5 px-4 text-sm font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {uploadStatus.loading ? 'Uploading...' : 'Save Mineral Details'}
            </button>

            {/* Status Messages */}
            {(uploadStatus.success || uploadStatus.error) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm text-sm">
                {uploadStatus.error && (
                  <div className="text-red-500">
                    {uploadStatus.error}
                  </div>
                )}
                {uploadStatus.success && (
                  <div className="space-y-2">
                    <div className="text-green-500">Successfully uploaded!</div>
                    <div className="text-xs text-bento-400 truncate">
                      <div>Image: {uploadStatus.imageUrl}</div>
                      <div>Metadata: {uploadStatus.metadataUrl}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 