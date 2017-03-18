var should = require('should');
var goodreads = require('../../lib/main')

describe('#client', function() {
    describe('public endpoint', function(){
        var client;
        before(function(done){
            var provider = new goodreads.provider({
                'client_key': process.env.OAUTH_GOODREADS_CLIENT_KEY || 'PLACEHOLDER_CLIENT_KEY',
                'client_secret' : process.env.OAUTH_GOODREADS_CLIENT_SECRET || 'PLACEHOLDER_CLIENT_SECRET'
            })
            provider.CreateClient()
                .then(function(_client){
                    client = _client
                })
                .then(done, done)
        })

        describe('UserGroups()', function() {
            it('should correctly respond with user groups', function(done) {

                client.UserGroups("8488829")
                    .then(function(data){
                        data.GoodreadsResponse.groups[0].list.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('AuthorBooks()', function() {
            it('should correctly respond with author\'s books', function(done) {
                client.AuthorBooks("4763")
                    .then(function(data){
                        data.GoodreadsResponse.author[0].name[0].should.be.eql('John Scalzi')
                    })
                    .then(done, done)
            });
        });

        describe('AuthorId()', function() {
            it('should correctly respond with author\'s info', function(done) {
                client.AuthorId("4763")
                    .then(function(data){
                        data.GoodreadsResponse.author[0].name[0].should.be.eql('John Scalzi')
                    })
                    .then(done, done)
            });
        });

        describe('BookIsbnToId()', function() {
            it('should correctly respond with book id when given ISBN', function(done) {
                client.BookIsbnToId("0765348276")
                    .then(function(data){
                        data.should.eql('51964')
                    })
                    .then(done, done)
            });
        });

        describe('BookReviewCounts()', function() {
            it('should correctly respond with book review counts', function(done) {
                client.BookReviewCounts("0765348276")
                    .then(function(data){
                        data.hash.status[0].should.be.a.String
                    })
                    .then(done, done)
            });
        });

        describe('BookShow()', function() {
            it('should correctly respond with book info', function(done) {
                client.BookShow("51964")
                    .then(function(data){
                        data.GoodreadsResponse.book[0].id[0].should.be.eql('51964')
                        data.GoodreadsResponse.book[0].title[0].should.be.eql( 'Old Man\'s War (Old Man\'s War, #1)')
                    })
                    .then(done, done)
            });
        });

        describe('ReviewsForBookByIsbn()', function() {
            it('should correctly respond with book reviews', function(done) {
                client.ReviewsForBookByIsbn("0765348276")
                    .then(function(data){
                        data.GoodreadsResponse.book[0].id[0].should.be.eql('51964')
                        data.GoodreadsResponse.book[0].title[0].should.be.eql( 'Old Man\'s War (Old Man\'s War, #1)')
                    })
                    .then(done, done)
            });
        });

        describe('SearchForBookTitleAuthor()', function() {
            it('should correctly respond with book', function(done) {
                client.SearchForBookTitleAuthor('Old Man\'s War')
                    .then(function(data){
                        data.GoodreadsResponse.book[0].id[0].should.be.eql('51964')
                        data.GoodreadsResponse.book[0].title[0].should.be.eql( 'Old Man\'s War (Old Man\'s War, #1)')
                    })
                    .then(done, done)
            });
        });

        describe('GroupMembers()', function() {
            it('should correctly respond with group members', function(done) {
                client.GroupMembers('8095')
                    .then(function(data){
                        data.GoodreadsResponse.group_users[0].group_user.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('GroupShow()', function() {
            it('should correctly respond with group info', function(done) {
                client.GroupShow('8095')
                    .then(function(data){
                        data.GoodreadsResponse.group[0].title[0].should.be.eql('Goodreads Developers')
                    })
                    .then(done, done)
            });
        });

        // describe('ListBook()', function() {
        //     it('should correctly respond with lists which contain book', function(done) {
        //         client.ListBook('51964')
        //             .then(function(data){
        //                 console.dir(data.GoodreadsResponse)
        //                 data.GoodreadsResponse.group[0].title[0].should.be.eql('Goodreads Developers')
        //             })
        //             .then(done, done)
        //     });
        // });

        describe('ReviewRecentReviews()', function() {
            it('should correctly respond with recent reviews', function(done) {
                client.ReviewRecentReviews()
                    .then(function(data){
                        data.GoodreadsResponse.reviews.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('ReviewShow()', function() {
            it('should correctly respond with recent reviews', function(done) {
                client.ReviewShow(22)
                    .then(function(data){
                        data.GoodreadsResponse.review.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('ReviewShowByUserAndBook()', function() {
            it('should correctly respond with recent reviews', function(done) {
                client.ReviewShowByUserAndBook(1, 50)
                    .then(function(data){
                        data.GoodreadsResponse.review.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('SearchGroup()', function() {
            it('should correctly respond with search results', function(done) {
                client.SearchGroup('adventure')
                    .then(function(data){
                        data.GoodreadsResponse.groups[0].list.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('SearchAuthorByName()', function() {
            it('should correctly respond with search results', function(done) {
                client.SearchAuthorByName('Orson Scott Card')
                    .then(function(data){
                        data.GoodreadsResponse.author[0].name[0].should.be.eql('Orson Scott Card')
                    })
                    .then(done, done)
            });
        });

        describe('SearchBooks()', function() {
            it('should correctly respond with search results', function(done) {
                client.SearchBooks('Ender\'s Game')
                    .then(function(data){
                        data.GoodreadsResponse.search[0].results.should.be.a.List
                    })
                    .then(done, done)
            });
        });

        describe('SeriesShow()', function() {
            it('should correctly respond with search results', function(done) {
                client.SeriesShow('40321-drina')
                    .then(function(data){
                        console.dir(data.GoodreadsResponse)
                        data.GoodreadsResponse.series[0].title[0].trim().should.be.eql('Drina')
                    })
                    .then(done, done)
            });
        });

        describe('SeriesShow()', function() {
            it('should correctly respond with series data', function(done) {
                client.SeriesShow('40321-drina')
                    .then(function(data){
                        data.GoodreadsResponse.series[0].title[0].trim().should.be.eql('Drina')
                    })
                    .then(done, done)
            });
        });

        describe('SeriesByAuthor()', function() {
            it('should correctly respond with series data', function(done) {
                client.SeriesByAuthor('227840')
                    .then(function(data){
                        data.GoodreadsResponse.series_works[0].series_work[0].id[0].should.be.eql('331195')
                    })
                    .then(done, done)
            });
        });

        describe('SeriesByBook()', function() {
            it('should correctly respond with series data', function(done) {
                client.SeriesByBook('118-drina-ballerina')
                    .then(function(data){
                        console.dir(data.GoodreadsResponse.series_works[0].series_work[0])
                        data.GoodreadsResponse.series_works[0].series_work[0].id[0].should.be.eql('144392')
                    })
                    .then(done, done)
            });
        });
    })


});