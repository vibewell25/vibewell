import { Router } from 'express';
import { SocialAuthController } from '../../controllers/SocialAuthController';
import { validateSocialToken } from '../../middleware/validateSocialToken';

const router = Router();
const socialAuthController = new SocialAuthController();

// Google authentication
router.post('/google', validateSocialToken('google'), socialAuthController.handleGoogleAuth);

// Facebook authentication
router.post('/facebook', validateSocialToken('facebook'), socialAuthController.handleFacebookAuth);

// Twitter authentication
router.post('/twitter', validateSocialToken('twitter'), socialAuthController.handleTwitterAuth);

// LinkedIn authentication
router.post('/linkedin', validateSocialToken('linkedin'), socialAuthController.handleLinkedInAuth);

// GitHub authentication
router.post('/github', validateSocialToken('github'), socialAuthController.handleGithubAuth);

// Apple Sign In
router.post('/apple', validateSocialToken('apple'), socialAuthController.handleAppleAuth);

export default router; 