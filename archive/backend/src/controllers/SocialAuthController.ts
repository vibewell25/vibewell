import { Request, Response } from 'express';

    import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import jwt from 'jsonwebtoken';

    import { User } from '../models/User';

    import { AuthService } from '../services/AuthService';

export class SocialAuthController {
    private authService: AuthService;
    private googleClient: OAuth2Client;

    constructor() {
        this.authService = new AuthService();
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
public handleGoogleAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idToken } = req.body;
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
const payload = ticket.getPayload();
            
            if (!payload) {
                res.status(400).json({ error: 'Invalid Google token' });
                return;
const user = await this.authService.findOrCreateSocialUser({
                email: payload.email!,
                name: payload.name!,
                provider: 'google',
                providerId: payload.sub,
                picture: payload.picture
const authToken = this.authService.generateAuthToken(user);
            res.json({ token: authToken, user });
catch (error) {
            console.error('Google auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
public handleFacebookAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accessToken } = req.body;
            const response = await axios.get(

    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
const { id, name, email, picture } = response.data;
            const user = await this.authService.findOrCreateSocialUser({
                email,
                name,
                provider: 'facebook',
                providerId: id,
                picture: picture.data.url
const authToken = this.authService.generateAuthToken(user);
            res.json({ token: authToken, user });
catch (error) {
            console.error('Facebook auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
public handleTwitterAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accessToken, accessTokenSecret } = req.body;
            // Implement Twitter OAuth 1.0a verification

    // This would require the twitter-api-v2 package or similar
            res.status(501).json({ error: 'Twitter auth not implemented' });
catch (error) {
            console.error('Twitter auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
public handleLinkedInAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accessToken } = req.body;

    const response = await axios.get('https://api.linkedin.com/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` }
const profileResponse = await axios.get(

    'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                { headers: { Authorization: `Bearer ${accessToken}` } }
const { id, localizedFirstName, localizedLastName } = response.data;
            const email = profileResponse.data.elements[0]['handle~'].emailAddress;

            const user = await this.authService.findOrCreateSocialUser({
                email,
                name: `${localizedFirstName} ${localizedLastName}`,
                provider: 'linkedin',
                providerId: id
const authToken = this.authService.generateAuthToken(user);
            res.json({ token: authToken, user });
catch (error) {
            console.error('LinkedIn auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
public handleGithubAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accessToken } = req.body;

    const response = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `token ${accessToken}` }
const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${accessToken}` }
const { id, name, avatar_url } = response.data;
            const primaryEmail = emailResponse.data.find((email: any) => email.primary).email;

            const user = await this.authService.findOrCreateSocialUser({
                email: primaryEmail,
                name: name || 'GitHub User',
                provider: 'github',
                providerId: id.toString(),
                picture: avatar_url
const authToken = this.authService.generateAuthToken(user);
            res.json({ token: authToken, user });
catch (error) {
            console.error('GitHub auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
public handleAppleAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idToken } = req.body;
            // Verify the Apple ID token
            const decodedToken = jwt.decode(idToken) as any;
            
            if (!decodedToken) {
                res.status(400).json({ error: 'Invalid Apple token' });
                return;
const user = await this.authService.findOrCreateSocialUser({
                email: decodedToken.email,
                name: decodedToken.name || 'Apple User',
                provider: 'apple',
                providerId: decodedToken.sub
const authToken = this.authService.generateAuthToken(user);
            res.json({ token: authToken, user });
catch (error) {
            console.error('Apple auth error:', error);
            res.status(500).json({ error: 'Authentication failed' });
