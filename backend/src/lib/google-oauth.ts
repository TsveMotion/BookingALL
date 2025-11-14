import axios from 'axios';
import { config } from '../config';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export async function getGoogleAuthUrl(redirectUri: string): Promise<string> {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    client_id: config.google.clientId,
    redirect_uri: redirectUri,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleUser(code: string, redirectUri: string): Promise<GoogleUser> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  try {
    const tokenResponse = await axios.post(tokenUrl, new URLSearchParams(values as any), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get<GoogleUser>(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return userResponse.data;
  } catch (error: any) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Google');
  }
}
