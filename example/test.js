(function() {
    var Q = require('q')
    , goodreads = require('../main.js')
    , http = require('http')
    , url = require('url')
    var readline = require('readline')
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    var provider = new goodreads.provider({
        'client_key': '',
        'client_secret' : ''
    })
    provider.oAuthGetRequestTokenUrl()
        .then(function(resp){
            console.log('Visit the url: ', resp.url);
            return resp;code

        })
        .then(function(resp){
            var deferred = Q.defer();
            rl.question('Enter the authorize code here:', function(code){
                deferred.resolve([resp, code])
            });
            return deferred.promise;
        })
        .spread(function(resp, code){
            console.log(arguments)
            return provider.oAuthGetAccessToken(resp.request_token, resp.request_token_secret, code)
        })
        .then(function(access_tokens){

            console.log(access_tokens)
        })
        .fail(function(err){
            console.log(err)
            console.log("AN ERROR OCCURED");
        })

}).call(this);