# Passport-osu

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [osu!](https://osu.ppy.sh/) using the OAuth 2.0 API.

This module lets you authenticate using osu! in your Node.js applications.
By plugging into Passport, osu! authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```
npm install passport-osu
```

## Usage

### Configure Strategy

The Reddit authentication strategy authenticates users using a Reddit
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```javascript
import OsuStrategy from 'passport-osu'; // or const OsuStrategy = require('passport-osu');

passport.use(new OsuStrategy({
    clientID: OSU2_CLIENT_ID,
    clientSecret: OSU2_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/osu/callback"
},
function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ osuId: profile.id }, function (err, user) {
    return done(err, user);
    });
}
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'osu'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get('/auth/osu', (_req: Request, _res: Response, next: any) => {
    next()
}, passport.authenticate('osu'));

app.get('/auth/osu/cb', passport.authenticate('osu', { failureRedirect: '/' }), (req: Request, res: Response) => {
    res.send("Success!");
});
```

## Examples

For a complete, working example, refer to the [login example](https://github.com/MiraiSubject/passport-osu/tree/master/example/login).

## References

- [Definitely Typed: passport-github2 types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/passport-github2)
- [Passport-Github2](https://github.com/cfsghost/passport-github)

## License

[The MIT License](http://opensource.org/licenses/MIT)
