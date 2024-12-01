const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// Debug logging
console.log('Environment Check:', {
  hasJWT: !!PINATA_JWT,
  jwtLength: PINATA_JWT?.length || 0,
  envType: process.env.NODE_ENV
});

export const uploadFileToPinata = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured');
  }

  try {
    console.log('Preparing file upload...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Pinata API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Pinata upload successful:', result);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', {
      message: error.message,
      stack: error.stack,
      jwt: PINATA_JWT ? 'Present' : 'Missing'
    });
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
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}; 