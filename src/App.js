import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { uploadFileToPinata, uploadJSONToPinata, getPinataUrl } from './utils/pinata';
import { useAccount, useWalletClient } from 'wagmi';
import { mintGemNFT } from './utils/contract';
import { providers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';

// Function to convert WalletClient to Ethers Signer
function walletClientToSigner(walletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  return provider.getSigner(account.address);
}

function App() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
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
  const [mintStatus, setMintStatus] = useState({ loading: false, error: null, hash: null });
  const [mintedTokenId, setMintedTokenId] = useState(null);

  // File input handler
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      setGemImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gemImage) {
      alert('Please select an image first');
      return;
    }

    if (!address || !walletClient) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      console.log("Starting upload process...");
      console.log("Image file:", gemImage);
      
      // Upload image
      const imageHash = await uploadFileToPinata(gemImage);
      console.log("Image uploaded successfully:", imageHash);
      
      // Create metadata
      const metadata = {
        name: gemData.name,
        description: gemData.description,
        image: getPinataUrl(imageHash),
        attributes: [
          { trait_type: "Mineral Name", value: gemData.name },
          { trait_type: "Locality", value: gemData.locality },
          { trait_type: "Weight", value: gemData.weight },
          { trait_type: "Size", value: gemData.size },
          { trait_type: "Description", value: gemData.description }
        ]
      };

      // Upload metadata
      const metadataHash = await uploadJSONToPinata(metadata);
      console.log("Metadata uploaded:", metadataHash);

      // 3. Convert wallet client to signer
      console.log("Converting wallet client to signer...");
      const signer = walletClientToSigner(walletClient);

      // 4. Mint NFT
      console.log("Minting NFT...");
      const receipt = await mintGemNFT(
        signer,
        getPinataUrl(metadataHash),
        {
          name: gemData.name,
          locality: gemData.locality,
          weight: gemData.weight.toString(),
          size: gemData.size,
          description: gemData.description
        }
      );

      // Get token ID from receipt
      const event = receipt.events.find(e => e.event === 'MineralMinted');
      const tokenId = event.args.tokenId.toString();
      
      // Set the minted token ID
      setMintedTokenId(tokenId);

      console.log("NFT minted! Transaction:", receipt);

      // 5. Update UI states
      setUploadStatus({
        loading: false,
        success: true,
        imageUrl: getPinataUrl(imageHash),
        metadataUrl: getPinataUrl(metadataHash)
      });

      setMintStatus({
        loading: false,
        error: null,
        hash: receipt.transactionHash
      });

      alert(`NFT Minted Successfully! Token ID: ${tokenId}`);

    } catch (error) {
      console.error("Error in process:", error);
      setMintStatus({
        loading: false,
        error: error.message,
        hash: null
      });
    }
  };

  const getOpenSeaURL = (tokenId) => {
    return `https://testnets.opensea.io/assets/base-sepolia/0xd09f301af1a674724b4973c7a8c43eec6af834bc/${tokenId}`;
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
                    src={URL.createObjectURL(gemImage)}
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
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
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

            <div className="mt-4">
              {mintStatus.loading && (
                <div className="text-blue-600">
                  Minting your NFT... Please confirm the transaction in your wallet.
                </div>
              )}
              {mintStatus.error && (
                <div className="text-red-600">
                  Error: {mintStatus.error}
                </div>
              )}
              {mintStatus.hash && (
                <div className="text-green-600">
                  ✅ NFT Minted! Transaction Hash: {mintStatus.hash}
                </div>
              )}
            </div>

            {/* Add QR Code section after successful mint */}
            {mintedTokenId && (
              <div className="mt-8 p-4 border rounded-lg bg-white shadow-md">
                <h3 className="text-lg font-semibold mb-4">View on OpenSea</h3>
                <div className="flex flex-col items-center">
                  <QRCodeSVG 
                    value={getOpenSeaURL(mintedTokenId)}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="mb-4"
                  />
                  <a
                    href={getOpenSeaURL(mintedTokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View NFT on OpenSea
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 