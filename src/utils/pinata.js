console.log('Pinata JWT exists:', !!process.env.REACT_APP_PINATA_JWT);
console.log('Pinata Gateway exists:', !!process.env.REACT_APP_PINATA_GATEWAY);

function validateJWT(jwt) {
  if (!jwt) {
    throw new Error('Pinata JWT is missing');
  }
  
  // JWT should have 3 parts separated by dots
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: token should have three parts');
  }

  // JWT should start with 'ey'
  if (!jwt.startsWith('ey')) {
    throw new Error('Invalid JWT format: token should start with "ey"');
  }

  return true;
}

export async function uploadFileToPinata(file) {
  const jwt = process.env.REACT_APP_PINATA_JWT;
  
  try {
    validateJWT(jwt);
    
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Pinata API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

export async function uploadJSONToPinata(jsonData) {
  const jwt = process.env.REACT_APP_PINATA_JWT;
  
  try {
    validateJWT(jwt);
    
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Pinata API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    throw error;
  }
}

export function getPinataUrl(ipfsHash) {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
} 