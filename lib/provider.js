var Q = require('q')
    , OAuth = require('oauth')
    , xml2js = require('xml2js')
    , util = require('util')
    , extend = require('node.extend')

var OAuth1 = OAuth.OAuth;
exports.provider = function (client_options) {


    this.options = {
        host: 'www.goodreads.com',
        port: 80,
        client_key: '',
        client_secret: '',
        callback: 'http://localhost:3000/callback',
        method: 'GET',
        path: '',
        oauth_request_url: 'http://goodreads.com/oauth/request_token',
        oauth_access_url: 'http://goodreads.com/oauth/access_token',
        oauth_version: '1.0',
        oauth_encryption: 'HMAC-SHA1',
        oauth_access_token: '',
        oauth_access_token_secret: ''
    };
    this.options = extend(this.options, client_options);

    if(!this.options.client_key || !this.options.client_secret){
        throw 'Consumer key and secret required!'
    }

    var oauthClient = new OAuth1(
        this.options.oauth_request_url,
        this.options.oauth_access_url,
        this.options.client_key,
        this.options.client_secret,
        this.options.oauth_version,
        this.options.callback,
        this.options.oauth_encryption);

    this.oAuthGetRequestTokenUrl = function oAuthGetAuthorizeUrl() {
        var self = this;
        var deferred = Q.defer();
        oauthClient.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results) {
            var url;
            if (err){
                return deferred.reject(err)
            }
            else {
                url = 'https://goodreads.com/oauth/authorize?oauth_token=' + oauthToken + '&oauth_callback=' + self.options.callback;
                return deferred.resolve({
                    request_token: oauthToken,
                    request_token_secret: oauthTokenSecret,
                    url: url
                });
            }
        })
        return deferred.promise;
    }

    this.oAuthGetAccessToken = function oAuthGetAccessToken(request_token, request_token_secret, authorize) {
        var self = this;
        var deferred = Q.defer();
        oauthClient.getOAuthAccessToken(
            request_token,
            request_token_secret,
            authorize,
            function(err, oauth_access_token, oauth_access_token_secret, results) {
                var parser;
                parser = new xml2js.Parser();
                if (err){
                    return deferred.reject(err)
                }
                else {
                    oauthClient.get(
                        'http://www.goodreads.com/api/auth_user',
                        oauth_access_token,
                        oauth_access_token_secret,
                        function(err, data, response) {
                            if (err) {
                                return deferred.reject(err);
                            } else {
                                return parser.parseString(data);
                            }
                        }
                    );
                }
                return parser.on('end', function(result) {
                    var resp = result.GoodreadsResponse;
                    console.log(resp.user);
                    if (resp && resp.user && resp.user[0]['$'].id !== null) {
                        self.oauth_access_token =  oauth_access_token;
                        self.oauth_access_token_secret =  oauth_access_token_secret;
                        return deferred.resolve({
                            'username': resp.user[0].name[0],
                            'userid': resp.user[0]['$'].id,
                            'success': 1,
                            'oauth_access_token': oauth_access_token,
                            'oauth_access_token_secret': oauth_access_token_secret
                        });
                    } else {
                        return deferred.reject([oauth_access_token, oauth_access_token_secret, results, result])
                    }
                });
            }
        );
        return deferred.promise;
    }

    //note, if oauth_data is provided, an AuthClient is created, otherwise only public api calls can be made.
    this.CreateClient = function (oauth_data) {
        var GoodreadsClient = require('./client')
        var client = new GoodreadsClient(oauth_data, this.options);
        return Q.when(client);
    }
};