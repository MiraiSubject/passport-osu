import OAuth2Strategy, { InternalOAuthError } from 'passport-oauth2';
import { OutgoingHttpHeaders } from 'http';

export default class OsuStrategy extends OAuth2Strategy {
    private userProfileUrl: string;

    constructor(options: StrategyOptionsWithRequest, verify: OAuth2Strategy.VerifyFunctionWithRequest)
    constructor(options: StrategyOptions, verify: OAuth2Strategy.VerifyFunction)
    constructor(options: any, verify: any) {
        options = options || {};
        options.customHeaders = options.customHeaders || {};
        options.authorizationURL = options.authorizationURL || 'https://osu.ppy.sh/oauth/authorize';
        options.tokenURL = options.tokenURL || 'https://osu.ppy.sh/oauth/token';
        options.scopeSeparator = options.scopeSeparator || ' ';
        
        super(options, verify);

        this.userProfileUrl = options.userProfileUrl || 'https://osu.ppy.sh/api/v2/me';
        this._oauth2.useAuthorizationHeaderforGET(true);
        this.name = "osu";
    }

    userProfile(accessToken: string, done: (err?: Error | null, profile?: PassportProfile) => void): void {
        this._oauth2.get(this.userProfileUrl, accessToken, (err, body) => {
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

    authorizationURL?: string;
    tokenURL?: string;
    userProfileUrl?: string;
    scopeSeparator?: string;
    customHeaders?: OutgoingHttpHeaders;
}

export interface StrategyOptions extends _StrategyOptionsBase {
    /**
     * @deprecated this property is not required anymore. This will be deleted in 6 months.
     */
    type?: 'StrategyOptions'
    passReqToCallback?: false | undefined;
}

export interface StrategyOptionsWithRequest extends _StrategyOptionsBase {
    /**
     * @deprecated this property is not required anymore. This will be deleted in 6 months.
     */
    type?: 'StrategyOptionsWithRequest'
    passReqToCallback?: true;
}

export interface PassportProfile {
    _raw: string;
    _json: any;
    provider: string;
    id: number;
    displayName: string;
}
