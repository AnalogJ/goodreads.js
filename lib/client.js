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

    function getAuthClient(){
        if(!_auth_data){
            throw new Error("This is an authenticated method, and required OAuth data.")
        }
        var oauth =
        { consumer_key: _provider_options.client_key
            , consumer_secret: _provider_options.client_secret
            , token: _auth_data.oauth_access_token
            , token_secret: _auth_data.oauth_access_token_secret
        }
        _goodreadsClientPromise = Q.when(request.defaults({oauth:oauth}));
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
                    else{
                        var parser = new xml2js.Parser({
                            emptyTag:null
                        });

                        parser.addListener('end', function(result) {
                            if(result){
                                return deferred.resolve(result);
                            }
                            else{
                                return deferred.reject({message:"Could not parse raw response", raw: body, parsed: result})
                            }
                        })

                        parser.addListener('error', function(error) {
                            return deferred.reject({message:"Could not parse raw response", raw: body, parsed: error})
                        })
                        parser.parseString(body)
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
            .then(requestGenerator('book/isbn_to_id.xml', {isbn:isbn},{raw:true}))
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
            .then(requestGenerator('book/isbn.xml', {isbn:isbn}))
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
            .then(requestGenerator('group/members.xml',{id:group_id}))
    }

    this.GroupShow = function(group_id){
        return getClient()
            .then(requestGenerator('group/show.xml', {id:group_id}))
    }

    this.ListBook = function(book_id){
        return getClient()
            .then(requestGenerator('list/book.xml', {id:book_id}))
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
            .then(requestGenerator('series/show.xml',{id:series_id}))

    }

    this.SeriesByAuthor = function(author_id){
        return getClient()
            .then(requestGenerator('series/list.xml',{id:author_id}))

    }
    this.SeriesByBook = function(book_id){
        return getClient()
            .then(requestGenerator('series/work.xml',{id:book_id}))
    }

    //######################################################################################################################
    //Auth API Methods
    //######################################################################################################################
    this.ReviewList = function(shelf_name,page){
        page = page || 1;
        return getAuthClient()
            .then(requestGenerator('review/list.xml',{
                v:'2',
                id: _auth_data.userid,
                shelf: shelf_name,
                sort: 'date_added',
                page: page
            }))
    }

    this.ShelfList = function(page){
        page = page || 1;
        return getAuthClient()
            .then(requestGenerator('shelf/list.xml',{page:page, user_id: _auth_data.userid}))
    };

    this.ShelfAddBook = function(shelf_name, book_id){
        return getAuthClient()
            .then(requestGenerator('shelf/add_to_shelf.xml',{name:shelf_name, book_id: book_id}))
    };
    this.ShelfAddBooks = function(shelf_name, book_ids){
        return getAuthClient()
            .then(requestGenerator('shelf/add_books_to_shelves.xml ',{shelves:shelf_name, bookids: book_ids.join(',')}))
    };
    this.ShelfRemoveBook = function(shelf_name,book_id){
        return getAuthClient()
            .then(requestGenerator('shelf/add_to_shelf.xml',{name:shelf_name, book_id: book_id, a:'remove'}))
    };
    this.ShelfCreate = function(name,sortable_flag){
        return getAuthClient()
            .then(requestGenerator('user_shelves.xml',{user_shelf:{name:name, sortable_flag: true}}))
    }

};
