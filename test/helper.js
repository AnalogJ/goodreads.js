'use strict';

///This is from https://github.com/porchdotcom/nock-back-mocha with some modifications

var path = require('path');
var nock = require('nock');
var sanitize = require('sanitize-filename');
nock.enableNetConnect();


var nockFixtureDirectory = path.resolve(path.resolve(__dirname,'fixtures'));

var filenames = [];

//TODO: these functions should be specified by the provider, not in the test runner.
//this function filters/transforms the request so that it matches the data in the recording.
function afterLoad(recording){
    recording.transformPathFunction = function(path){
        return removeSensitiveData(path);
    }

    // recording.scopeOptions.filteringScope = function(scope) {
    //
    //     console.log("SCOPE", scope)
    //     return /^https:\/\/api[0-9]*.dropbox.com/.test(scope);
    // };
    // recording.scope = recording.scope.replace(/^https:\/\/api[0-9]*.dropbox.com/, 'https://api.dropbox.com')
}

//this function removes any sensitive data from the recording so that it will not be included in git repo.
function afterRecord(recordings) {
    console.log('>>>> Removing sensitive data from recording');
    // console.dir(recordings);

    for(var ndx in recordings){
        var recording = recordings[ndx]

        recording.path = removeSensitiveData(recording.path)
        recording.response = removeSensitiveData(recording.response)
    }
    return recordings
};


function removeSensitiveData(rawString){
    rawString = rawString.toString()
    if(process.env.OAUTH_GOODREADS_CLIENT_KEY) {
        rawString = rawString.replace(new RegExp(process.env.OAUTH_GOODREADS_CLIENT_KEY, 'g') , 'PLACEHOLDER_CLIENT_KEY')
    }

    if(process.env.OAUTH_GOODREADS_CLIENT_SECRET){
        rawString = rawString.replace(new RegExp( process.env.OAUTH_GOODREADS_CLIENT_SECRET, "g"), 'PLACEHOLDER_CLIENT_SECRET' )
    }
    return rawString
}


beforeEach(function (done) {

    var filename = sanitize(this.currentTest.fullTitle() + '.json');
    // make sure we're not reusing the nock file
    if (filenames.indexOf(filename) !== -1) {
        return done(new Error('goodreads.js does not support multiple tests with the same name. `' + filename + '` cannot be reused.'));
    }
    filenames.push(filename);

    var previousFixtures = nock.back.fixtures;
    nock.back.fixtures = nockFixtureDirectory;
    nock.back.setMode('record');
    nock.back(filename, {
        after: afterLoad,
        afterRecord: afterRecord
    }, function (nockDone) {
        this.currentTest.nockDone = function () {
            nockDone();
            nock.back.fixtures = previousFixtures;
        };
        done();
    }.bind(this));
});

afterEach(function () {
    this.currentTest.nockDone();
});