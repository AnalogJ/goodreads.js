var Q = require('q')
    , request = require('request')
    , xml2js = require('xml2js')
    , url = require('url')
//    , errorTypes = require('../errors.js')
//    , FFParameterAbsent = errorTypes.FFParameterAbsent
//    , FFTokenRejected = errorTypes.FFTokenRejected
//    , FFAdditionalAuthorizationRequired = errorTypes.FFAdditionalAuthorizationRequired
//    , FFParameterRejected = errorTypes.FFParameterRejected;

module.exports = function (auth_data, provider_options) {

    if (!auth_data)
        console.warn("auth_data not provided, only public calls can be executed.");


    var _auth_data = auth_data;
    var _provider_options = provider_options || {};
    var _goodreadsClientPromise = null;

    function getClient() {
        if (_goodreadsClientPromise) return _goodreadsClientPromise;

//        if(_auth_data){
//            //authorized client
//            var oauthClient = new OAuth1(
//                _provider_options.oauth_request_url,
//                _provider_options.oauth_access_url,
//                _provider_options.client_key,
//                _provider_options.client_secret,
//                _provider_options.oauth_version,
//                _provider_options.callback,
//                _provider_options.oauth_encryption);
//        }

        _goodreadsClientPromise = Q.when(request.defaults({}));
        return _goodreadsClientPromise;
    }

    //custom error detection method.
    function errorHandler(response, err) {
        if (err) return err;

        //error codes parsed from http://developers.box.com/oauth/
        var err_message = response.headers['www-authenticate'] || '';
        if (response.statusCode == 400) return new FFParameterAbsent(err_message);
        if (response.statusCode == 401) return  new FFTokenRejected(err_message);
        if (response.statusCode == 403) return new FFAdditionalAuthorizationRequired(err_message);

        return false;
    }


    function requestGenerator(endpoint_url, query_params,options){
        var uri = url.parse('https://www.goodreads.com/' +endpoint_url);
        uri.query =  query_params || {};
        uri.query.key = _provider_options.client_key;
        uri.query.utf8='✓';
        return function(client){
            var deferred = Q.defer();
            client.get(
                {
                    uri:url.format(uri)
                },
                function (err, r, body) {
                    if (err) return deferred.reject(err);
                    if(options && options.raw){
                        return deferred.resolve(body);
                    }
                    else if(options && options.json){
                        return deferred.resolve(JSON.parse(body))
                    }
                    else{
                        var parser = new xml2js.Parser({
                            emptyTag:null
                        });

                        // parser.addListener('end', function(result) {
                        //     if(result){
                        //         return deferred.resolve(result);
                        //     }
                        //     else{
                        //         return deferred.reject({message:"Could not parse raw response", raw: body, parsed: result})
                        //     }
                        // })
                        //
                        // parser.addListener('error', function(error) {
                        //     return deferred.reject({message:"Could not parse raw response", raw: body, parsed: error})
                        // })
                        parser.parseString(body, function (err, result) {

                            if(err) return deferred.reject({message:"Could not parse raw response", raw: body, parsed: err})
                            if(result){
                                return deferred.resolve(result);
                            }
                            else{
                                return deferred.reject({message:"Could not parse raw response", raw: body, parsed: result})
                            }

                        });
                    }
                }
            );
            return deferred.promise;
        }
    }


//######################################################################################################################
//Public API Methods
//######################################################################################################################

    this.UserGroups = function(user_id){
        return getClient()
            .then(requestGenerator('group/list.xml', {id:user_id}))
    }

    this.AuthorBooks = function(author_id){
        return getClient()
            .then(requestGenerator('author/list.xml', {id:author_id}))
    }
    this.AuthorId = function(author_id){
        return getClient()
            .then(requestGenerator('author/show.xml', {id:author_id}))
    }


    this.BookIsbnToId = function(isbn){
        return getClient()
            .then(requestGenerator('book/isbn_to_id', {isbn:isbn},{raw:true}))
            .then(function(book_id){
                if(book_id =="No book with that ISBN"){
                    return q.reject("")
                }
                else{
                    return book_id
                }
            })
    }

    this.BookReviewCounts = function(comma_seperated_isbns){
        return getClient()
            .then(requestGenerator('book/review_counts.xml', {isbns:comma_seperated_isbns}))
    }

    this.BookShow = function(book_id){
        return getClient()
            .then(requestGenerator('book/show.xml', {id:book_id}))
    }

    this.ReviewsForBookByIsbn = function(isbn){
        return getClient()
            .then(requestGenerator('book/isbn/'+isbn, {format:'xml'}))
    }


    this.SearchForBookTitleAuthor = function(title, author){
        var options = {title:title}
        if(author){
            options.author = author;
        }
        return getClient()
            .then(requestGenerator('book/title.xml', options))
    }

    this.GroupMembers = function(group_id){
        return getClient()
            .then(requestGenerator('group/members/'+group_id+'.xml'))
    }

    this.GroupShow = function(group_id){
        return getClient()
            .then(requestGenerator('group/show.xml', {id:group_id}))
    }

    this.ListBook = function(book_id){
        return getClient()
            .then(requestGenerator('list/book/'+book_id+'.xml'))
    }


    this.ReviewRecentReviews = function(){
        return getClient()
            .then(requestGenerator('review/recent_reviews.xml'))
    }

    this.ReviewShow = function(review_id, page){
        page = page || 1;
        return getClient()
            .then(requestGenerator('review/show.xml',{id: review_id, page:page}))
    }

    this.ReviewShowByUserAndBook = function(user_id, book_id, include_review_on_work){
        return getClient()
            .then(requestGenerator('review/show_by_user_and_book.xml', {user_id:user_id, book_id:book_id, include_review_on_work: include_review_on_work}))
    }

    this.SearchGroup = function(group_query){
        return getClient()
            .then(requestGenerator('group/search.xml', {q:group_query}))
    }

    this.SearchAuthorByName = function(author_name){
        return getClient()
            .then(requestGenerator('api/author_url/'+author_name))
    }
    this.SearchBooks = function(title_author_or_isbn_query, page){
        page = page || 1;
        return getClient()
            .then(requestGenerator('search.xml',{q:title_author_or_isbn_query, page:page}))
    }

    this.SeriesShow = function(series_id){
        return getClient()
            .then(requestGenerator('series/show/' + series_id, {format:'xml'}))

    }

    this.SeriesByAuthor = function(author_id){
        return getClient()
            .then(requestGenerator('series/list',{format:'xml', id:author_id}))

    }
    this.SeriesByBook = function(book_id){
        return getClient()
            .then(requestGenerator('work/' + book_id+ '/series',{format: 'xml'}))
    }
};
