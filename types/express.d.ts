// This file extends the Express Request type to include a 'user' property.

// Define the structure of the user payload from Google's userinfo endpoint
interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

declare namespace Express {
  export interface Request {
    user?: GoogleUserInfo;
  }
}