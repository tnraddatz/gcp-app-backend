import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate a user via a Google access token.
 * It validates the token by calling Google's userinfo endpoint and attaches
 * the user's profile information to the `req.user` object.
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: No token provided or malformed header.' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Use the access token to get user information from Google.
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Failed to fetch user info: ${response.status} ${errorBody}`
      );
      throw new Error('Invalid token');
    }

    // The token is valid. Attach the user data to the request.
    // The `req.user` type is extended in `backend/types/express.d.ts`.
    req.user = (await response.json()) as GoogleUserInfo;

    // Proceed to the next middleware or route handler.
    return next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};