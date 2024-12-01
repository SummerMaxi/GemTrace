import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x..." // You'll add this after deploying
const CONTRACT_ABI = [
  "function mint(string memory tokenURI, string memory mineralName, string memory locality, uint256 weight, string memory size, string memory description) public returns (uint256)",
  "event MineralMinted(uint256 indexed tokenId, address indexed owner, string mineralName, string locality, uint256 weight, string size, string description)"
];

export const mintGemNFT = async (signer, tokenURI, mineralData) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const tx = await contract.mint(
      tokenURI,
      mineralData.name,
      mineralData.locality,
      mineralData.weight,
      mineralData.size,
      mineralData.description
    );

    return await tx.wait();
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}; 