import express, { Express, Request, Response } from 'express'
import OsuStrategy from 'passport-osu';
import passport from 'passport';

export default class Server {
    private app: Express;

    constructor() {
        this.app = express();
    }

    async start(): Promise<void> {

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        const clientID = 'clientID';
        const clientSecret = 'clientSecret';
        const callbackUrl = "http://localhost:8000/auth/osu/cb";

        const strat: OsuStrategy = new OsuStrategy({
            clientID,
            clientSecret,
            callbackURL: callbackUrl
        }, (_accessToken: string, _refreshToken: string, profile: any, cb: any) => {
            cb(null, profile);
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
