import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../mongoose/schemas/index.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
passport.use(
    'google',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const user = await User.findOne({
                    'account.type': 'google',
                    'account.account_id': profile.id,
                });
                if (!user) {
                    console.log('Adding new Google user to DB..');
                    const newUser = new User({
                        email: profile.email,
                        name: `${profile.name.givenName} ${profile.name.familyName}`,
                        avatar: profile.picture,
                        account: {
                            type: 'google',
                            account_id: profile.id,
                        },
                    });
                    await newUser.save();
                    cb(null, newUser);
                } else {
                    console.log('Google User already exists in DB..');
                    cb(null, user);
                }
            } catch (error) {
                cb(error, null);
            }
        },
    ),
);

passport.use(
    'facebook',
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: '/auth/facebook/callback',
            scope: ['email'],
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const user = await User.findOne({
                    'account.type': 'facebook',
                    'account.account_id': profile.id,
                });
                if (!user) {
                    console.log('Adding new Facebook user to DB..');
                    const newUser = new User({
                        email: profile.emails,
                        name: profile.displayName,
                        avatar: profile.profileUrl,
                        account: {
                            type: 'facebook',
                            account_id: profile.id,
                        },
                    });
                    await newUser.save();
                    cb(null, newUser);
                } else {
                    console.log('Facebook User already exists in DB..');
                    cb(null, user);
                }
            } catch (error) {
                cb(error, null);
            }
        },
    ),
);

// JWT strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await User.findById(payload.id);
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err, false);
        }
    }),
);

export default passport;
