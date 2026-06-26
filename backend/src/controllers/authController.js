const authService = require('../services/authService');
const asyncHandler = require('../middlewares/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please check your email to verify your account.',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: result,
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    await authService.logout(req.user._id, refreshToken);
  }
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.query.token);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});

const googleRedirect = asyncHandler(async (req, res) => {
  const origin = req.query.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`;
  
  if (!clientId) {
    console.error('Google OAuth Client ID is not configured in .env');
    return res.redirect(`${origin}/auth/login?error=google_not_configured`);
  }
  
  const state = encodeURIComponent(JSON.stringify({ origin }));
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&state=${state}`;
  res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`;
  
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (state) {
    try {
      const decodedState = JSON.parse(decodeURIComponent(state));
      if (decodedState && decodedState.origin) {
        frontendUrl = decodedState.origin;
      }
    } catch (e) {
      frontendUrl = decodeURIComponent(state);
    }
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
  }

  let email, name, googleId;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      throw new Error(tokens.error_description || 'Failed to exchange Google OAuth code');
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userInfo = await userInfoRes.json();
    email = userInfo.email;
    name = userInfo.name || userInfo.given_name;
    googleId = userInfo.sub;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
  }

  const result = await authService.socialLogin({ email, name, provider: 'google', providerId: googleId });
  res.redirect(`${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`);
});

const githubRedirect = asyncHandler(async (req, res) => {
  const origin = req.query.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`;
  
  if (!clientId) {
    console.error('GitHub OAuth Client ID is not configured in .env');
    return res.redirect(`${origin}/auth/login?error=github_not_configured`);
  }
  
  const state = encodeURIComponent(JSON.stringify({ origin }));
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;
  res.redirect(url);
});

const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`;
  
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (state) {
    try {
      const decodedState = JSON.parse(decodeURIComponent(state));
      if (decodedState && decodedState.origin) {
        frontendUrl = decodedState.origin;
      }
    } catch (e) {
      frontendUrl = decodeURIComponent(state);
    }
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/auth/login?error=github_auth_failed`);
  }

  let email, name, githubId;

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: redirectUri
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      throw new Error(tokens.error_description || 'Failed to exchange GitHub OAuth code');
    }

    const userInfoRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'MailServis-Backend'
      }
    });
    const userInfo = await userInfoRes.json();
    name = userInfo.name || userInfo.login;
    githubId = String(userInfo.id);

    email = userInfo.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'User-Agent': 'MailServis-Backend'
        }
      });
      const emails = await emailsRes.json();
      const primaryEmail = emails.find(e => e.primary && e.verified) || emails[0];
      email = primaryEmail ? primaryEmail.email : null;
    }

    if (!email) {
      throw new Error('No verified email found on GitHub account.');
    }
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    return res.redirect(`${frontendUrl}/auth/login?error=github_auth_failed`);
  }

  const result = await authService.socialLogin({ email, name, provider: 'github', providerId: githubId });
  res.redirect(`${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`);
});

module.exports = {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword, verifyEmail, getMe,
  googleRedirect, googleCallback, githubRedirect, githubCallback,
};
