import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xd09f301af1a674724b4973c7a8c43eec6af834bc";

// Full ABI for GemTraceNFT
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "mineralName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "locality",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "size",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "mineralName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "locality",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "size",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "MineralMinted",
    "type": "event"
  }
];

export const mintGemNFT = async (signer, tokenURI, mineralData) => {
  try {
    console.log("Creating contract instance...");
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Signer:", signer.getAddress());
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    console.log("Preparing mint transaction with data:", {
      tokenURI,
      ...mineralData
    });

    // Convert weight to BigNumber if it's not already
    const weightBN = ethers.utils.parseUnits(mineralData.weight.toString(), 'ether');
    
    console.log("Sending mint transaction...");
    const tx = await contract.mint(
      tokenURI,
      mineralData.name,
      mineralData.locality,
      weightBN, // Send weight as BigNumber
      mineralData.size,
      mineralData.description,
      { gasLimit: 500000 } // Add gas limit to prevent underestimation
    );

    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Get the token ID from the event
    const event = receipt.events?.find(e => e.event === 'MineralMinted');
    const tokenId = event?.args?.tokenId;
    console.log("Minted Token ID:", tokenId?.toString());

    return receipt;
  } catch (error) {
    console.error("Error in mintGemNFT:", error);
    throw error;
  }
}; 