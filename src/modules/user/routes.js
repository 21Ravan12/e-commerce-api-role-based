const express = require('express');
const router = express.Router();
const AccountController = require('./controllers/accountController');
const authController = require('./controllers/authController');
const { authenticate } = require('../../core/security/jwt');


router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.post('/register', authController.register);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/complete-registration', authController.completeRegistration);

router.get('/oauth/:provider', authController.oAuthRedirect);
router.get('/oauth/:provider/callback', authController.oAuthCallback);

router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);


// Profile Routes
router.get('/profile/get', authenticate, AccountController.getProfile);
router.patch('/profile/update', authenticate, AccountController.updateProfile);

// Personal Data Routes
router.get('/personalData/get', authenticate, AccountController.getPersonalData);
router.patch('/personalData/update/attempt', authenticate, AccountController.initiateUpdatePersonalData);
router.patch('/personalData/update/complete', authenticate, AccountController.completeUpdatePersonalData);

// Account Status Routes
router.patch('/deactivate', authenticate, AccountController.deactivateAccount);
router.delete('/delete', authenticate, AccountController.deleteAccount);

// Two-Factor Authentication Routes
router.post('/2fa/enable', authenticate, AccountController.setupTwoFactor);
router.post('/2fa/disable', authenticate, AccountController.disableTwoFactor);

// Social Account Routes
router.post('/social/link', authenticate, AccountController.linkSocialAccount);
router.post('/social/unlink', authenticate, AccountController.unlinkSocialAccount);

// Preference Routes
router.get('/preferences/get', authenticate, AccountController.getPreferences);
router.patch('/preferences/update', authenticate, AccountController.updatePreferences);

// Mfa Routes
router.post('/enable-mfa', authenticate, AccountController.enableMfa);
router.post('/disable-mfa', authenticate, AccountController.disableMfa);
router.post('/verify-mfa', authenticate, AccountController.verifyMfa);


module.exports = router;