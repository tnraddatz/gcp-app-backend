const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Extract the access token from the header
  const accessToken = authHeader.split(' ')[1];

  try {
    // 1. Use the access token to call Google's userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // This means the token was invalid or expired
      throw new Error('Invalid token');
    }

    // 2. The token is valid. Attach the user data to the request.
    const googleUser = await response.json();
    req.user = googleUser; // e.g., { sub, name, email, picture, ... }

    // 3. Proceed to your actual API logic
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = authenticateToken;
