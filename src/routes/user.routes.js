import { Router } from 'express';
import passport from 'passport';
import {
	getAllUsers,
	getUserId,
	deleteInactiveUsers,
	loginUser,
	loginGithub,
	loginGithubCallBack,
	registerUser,
	failRegister,
	currentUser,
	logoutUser,
	uploadUserFiles,
	toggleUserRole,
	sendResetPassEmail,
	resetPassword,
} from '../controllers/user.controller.js';
import handleLoginSession from '../middlewares/login.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const userRouter = Router();

userRouter.get(
	'/',
	passport.authenticate('current', { session: false }),
	getAllUsers
);

userRouter.get(
	'/getid/:eml',
	passport.authenticate('current', { session: false }),
	getUserId
);

userRouter.delete(
	'/',
	passport.authenticate('current', { session: false }),
	deleteInactiveUsers
);

userRouter.post('/login', handleLoginSession, loginUser);

userRouter.get(
	'/github',
	passport.authenticate('github', { scope: ['user:email'] }),
	loginGithub
);
userRouter.get(
	'/githubcallback',
	passport.authenticate('github', { failureRedirect: '/' }),
	loginGithubCallBack
);

userRouter.post(
	'/register',
	passport.authenticate('register', {
		failureRedirect: 'failregister',
	}),
	registerUser
);

userRouter.get('/failregister', failRegister);

userRouter.get(
	'/current',
	passport.authenticate('current', { session: false }),
	currentUser
);

userRouter.put(
	'/premium/:uid',
	passport.authenticate('current', { session: false }),
	toggleUserRole
);

userRouter.post(
	'/:uid/documents',
	passport.authenticate('current', { session: false }),
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'productImage', maxCount: 1 },
		{ name: 'userDocument', maxCount: 1 },
		{ name: 'personal-identification', maxCount: 1 },
		{ name: 'proof-of-address', maxCount: 1 },
		{ name: 'proof-of-account-status', maxCount: 1 },
	]),
	uploadUserFiles
);

userRouter.post('/reset-password', sendResetPassEmail);

userRouter.put('/reset-password/:tkn', resetPassword);

userRouter.post('/logout', logoutUser);

export { userRouter };
