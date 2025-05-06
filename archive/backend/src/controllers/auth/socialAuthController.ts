import { Request, Response } from 'express';

    import SocialAuthService from '../../services/auth/socialAuth';

    import { generateAuthTokens } from '../../utils/auth';

    import { validateEnv } from '../../utils/env';

class SocialAuthController {
  private static instance: SocialAuthController;
  private socialAuthService: SocialAuthService;

  private constructor() {
    const config = {
      google: {
        clientId: validateEnv('GOOGLE_CLIENT_ID'),
        clientSecret: validateEnv('GOOGLE_CLIENT_SECRET')
facebook: {
        appId: validateEnv('FACEBOOK_APP_ID'),
        appSecret: validateEnv('FACEBOOK_APP_SECRET')
twitter: {
        apiKey: validateEnv('TWITTER_API_KEY'),
        apiSecret: validateEnv('TWITTER_API_SECRET')
linkedin: {
        clientId: validateEnv('LINKEDIN_CLIENT_ID'),
        clientSecret: validateEnv('LINKEDIN_CLIENT_SECRET')
github: {
        clientId: validateEnv('GITHUB_CLIENT_ID'),
        clientSecret: validateEnv('GITHUB_CLIENT_SECRET')
apple: {
        clientId: validateEnv('APPLE_CLIENT_ID'),
        teamId: validateEnv('APPLE_TEAM_ID'),
        keyId: validateEnv('APPLE_KEY_ID'),
        privateKey: validateEnv('APPLE_PRIVATE_KEY')
this.socialAuthService = SocialAuthService.getInstance(config);
public static getInstance(): SocialAuthController {
    if (!SocialAuthController.instance) {
      SocialAuthController.instance = new SocialAuthController();
return SocialAuthController.instance;
public googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
const profile = await this.socialAuthService.verifyGoogleToken(token);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
public facebookAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
const profile = await this.socialAuthService.verifyFacebookToken(token);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
public twitterAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, secret } = req.body;
      if (!token || !secret) {
        res.status(400).json({ error: 'Token and secret are required' });
        return;
const profile = await this.socialAuthService.verifyTwitterToken(token, secret);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
public linkedinAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
const profile = await this.socialAuthService.verifyLinkedInToken(token);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
public githubAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
const profile = await this.socialAuthService.verifyGithubToken(token);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
public appleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
const profile = await this.socialAuthService.verifyAppleToken(token);
      const user = await this.socialAuthService.authenticateUser(profile);
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      res.json({ user, accessToken, refreshToken });
catch (error) {
      res.status(401).json({ error: error.message });
export default SocialAuthController; 