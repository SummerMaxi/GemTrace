const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

console.log('Environment Check:', {
  hasJWT: !!PINATA_JWT,
  jwtLength: PINATA_JWT?.length,
  environment: process.env.NODE_ENV
});

export const uploadFileToPinata = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Use the hardcoded JWT if environment variable is not available
  const JWT = PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzODY0ZmU3Yi04OWQ2LTRkNTQtYWI1NC0wNzJlMjkxOWM0NmQiLCJlbWFpbCI6IjEyMzk5ZGVzaWduQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMjUzM2ZhZjgwYWRhNjI1MmJlYSIsInNjb3BlZEtleVNlY3JldCI6IjI5MWI3YmU1Y2EwNWY4NGMyOTExY2I0MzYxNjY1M2JhNjA5ZWZhZmY0MWUyNjAwZjQ3ZDU0ZWQ1MjcxZDRjMDIiLCJleHAiOjE3NjQ1ODc0NDV9.fU8NDifrt82W_AOWIqoZrul74tMg9j2n2zP09VL1AtU';

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
        'Authorization': `Bearer ${JWT}`
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
      stack: error.stack
    });
    throw error;
  }
};

export const uploadJSONToPinata = async (jsonData) => {
  // Use the hardcoded JWT if environment variable is not available
  const JWT = PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzODY0ZmU3Yi04OWQ2LTRkNTQtYWI1NC0wNzJlMjkxOWM0NmQiLCJlbWFpbCI6IjEyMzk5ZGVzaWduQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMjUzM2ZhZjgwYWRhNjI1MmJlYSIsInNjb3BlZEtleVNlY3JldCI6IjI5MWI3YmU1Y2EwNWY4NGMyOTExY2I0MzYxNjY1M2JhNjA5ZWZhZmY0MWUyNjAwZjQ3ZDU0ZWQ1MjcxZDRjMDIiLCJleHAiOjE3NjQ1ODc0NDV9.fU8NDifrt82W_AOWIqoZrul74tMg9j2n2zP09VL1AtU';

  try {
    console.log('Uploading JSON data:', jsonData);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT}`
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata JSON upload failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    throw error;
  }
};

export const getPinataUrl = (cid) => {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}; 