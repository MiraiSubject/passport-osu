import express, { Express, Request, Response } from 'express'
import OsuStrategy from '../../src/index';
import { config } from 'dotenv';
import passport from 'passport';
import session from 'express-session'
config();

export default class Server {
    private app: Express;

    constructor() {
        this.app = express();
    }

    async start(): Promise<void> {

        const sessionOptions: session.SessionOptions = {
            name: '_session',
            secret: `DO NOT USE IN PROD`,
            resave: false,
            proxy: true,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: 300 * 1000
            },
        }

        this.app.use(session(sessionOptions));
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        const clientID = `${process.env.CLIENT_ID}` || 'clientID';
        const clientSecret = `${process.env.CLIENT_SECRET}` || 'clientSecret';
        const callbackUrl = "http://localhost:8000/auth/osu/cb";

        const strat: OsuStrategy = new OsuStrategy({
            clientID,
            clientSecret,
            // If you want to read a specific mode from the user instead of 
            // the default game mode, change this to match the appropriate game mode
            userProfileUrl: 'https://osu.ppy.sh/api/v2/me/osu',
            callbackURL: callbackUrl
        }, (_accessToken: string, _refreshToken: string, profile: any, cb: any) => {
            console.log(profile);
            return cb(null, profile);
        });

        passport.use(strat);

        passport.serializeUser((user: any, done: any) => {
            done(null, user);
        });

        passport.deserializeUser((user: any, done: any) => {
            done(null, user);
        });

        this.app.get('/auth/osu', (_req: Request, _res: Response, next: any) => {
            next()
        }, passport.authenticate('osu'));

        this.app.get('/auth/osu/cb', passport.authenticate('osu', { failureRedirect: '/' }), (req: Request, res: Response) => {
            res.send("Success!");
        });

        const host = '127.0.0.1';
        const port = Number(process.env.PORT || 8000);
        this.app.listen(port, host);
        console.log(`Basic server listening on http://${host}:${port}\nAuthentication URL is http://${host}:${port}/auth/osu`);
    }
}

new Server().start();
