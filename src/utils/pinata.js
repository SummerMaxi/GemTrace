const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.REACT_APP_PINATA_GATEWAY || "gateway.pinata.cloud";

console.log('JWT Check:', {
  exists: !!PINATA_JWT,
  length: PINATA_JWT?.length,
  firstChars: PINATA_JWT?.substring(0, 20)
});

export const uploadFileToPinata = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  console.log('Environment check:', {
    hasReactEnv: !!process.env.REACT_APP_PINATA_JWT,
    hasNextEnv: !!process.env.NEXT_PUBLIC_PINATA_JWT,
    finalJWT: !!PINATA_JWT
  });

  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured in environment');
  }

  try {
    console.log('Preparing file upload...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT.trim()}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Pinata error response:', result);
      throw new Error(`Pinata upload failed: ${result.error?.details || JSON.stringify(result)}`);
    }

    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
};

export const uploadJSONToPinata = async (jsonData) => {
  try {
    console.log('Uploading JSON data:', jsonData);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    console.log('JSON upload response:', result);

    if (!response.ok) {
      throw new Error(`Pinata JSON upload failed: ${result.error?.details || 'Unknown error'}`);
    }

    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    throw error;
  }
};

export const getPinataUrl = (cid) => {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}; 