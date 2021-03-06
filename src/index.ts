import OAuth2Strategy, { InternalOAuthError } from 'passport-oauth2';
import { OutgoingHttpHeaders } from 'http';
import passport from 'passport';

export default class OsuStrategy extends OAuth2Strategy {

    constructor(options: StrategyOptions | StrategyOptionsWithRequest, verify: OAuth2Strategy.VerifyFunction | OAuth2Strategy.VerifyFunctionWithRequest) {
        options = options || {};
        options.customHeaders = options.customHeaders || {};
        options.authorizationURL = options.authorizationURL || 'https://osu.ppy.sh/oauth/authorize';
        options.tokenURL = options.tokenURL || 'https://osu.ppy.sh/oauth/token';
        options.scopeSeparator = options.scopeSeparator || ' ';

        if (options.type === "StrategyOptions") 
            super(options as OAuth2Strategy.StrategyOptions, verify as OAuth2Strategy.VerifyFunction);
         else 
            super(options as OAuth2Strategy.StrategyOptionsWithRequest, verify as OAuth2Strategy.VerifyFunctionWithRequest);

        this._oauth2.useAuthorizationHeaderforGET(true);
        this.name = "osu";
    }

    userProfile(accessToken: string, done: (err?: Error | null, profile?: PassportProfile) => void): void {
        this._oauth2.get('https://osu.ppy.sh/api/v2/me', accessToken, (err, body) => {
            if (err || body instanceof Buffer || body === undefined) 
                return done(new InternalOAuthError('Failed to fetch the user profile.', err))

            try {
                const json = JSON.parse(body)
                const parsedData: PassportProfile = {
                    _raw: body,
                    _json: json,
                    provider: "osu",
                    id: json.id,
                    displayName: json.username
                }
                return done(null, parsedData);
            } catch (e) {
                return done(new InternalOAuthError('Failed to parse the user profile.', e));
            }
        });
    }
}

export interface StrategyOption extends passport.AuthenticateOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;

    scope?: string[];
    userAgent?: string;

    authorizationURL?: string;
    tokenURL?: string;
    scopeSeparator?: string;
    customHeaders?: OutgoingHttpHeaders;
}

export type OAuth2StrategyOptionsWithoutRequiredURLs = Pick<
    OAuth2Strategy._StrategyOptionsBase,
    Exclude<keyof OAuth2Strategy._StrategyOptionsBase, 'authorizationURL' | 'tokenURL'>
>;

export interface _StrategyOptionsBase extends OAuth2StrategyOptionsWithoutRequiredURLs {
    clientID: string;
    clientSecret: string;
    callbackURL: string;

    scope?: string[];
    userAgent?: string;
    state?: string;

    authorizationURL?: string;
    tokenURL?: string;
    scopeSeparator?: string;
    customHeaders?: OutgoingHttpHeaders;
}

export interface StrategyOptions extends _StrategyOptionsBase {
    type: 'StrategyOptions';
    passReqToCallback?: false;
}

export interface StrategyOptionsWithRequest extends _StrategyOptionsBase {
    type: 'StrategyOptionsWithRequest';
    passReqToCallback: true;
}

export interface PassportProfile {
    _raw: string;
    _json: any;
    provider: string;
    id: number;
    displayName: string;
}
