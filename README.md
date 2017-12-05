goodreads.js
============

### install
```
npm i goodreads.js --save
```

### usage
```js
let goodreads = require('goodreads.js')

const auth = new goodreads.provider({ client_key: '*', client_secret: '*' })

auth.CreateClient()
.then(client => {
  client.SearchBooks('crime and punishment').then(response => {
    const { results } = response.GoodreadsResponse.search[0]
    const { work } = results[0]

    for (let { best_book } of work) {
      console.log(best_book)
    }
  })
})
```

GoodReads NodeJS API

# Public/Unauthenticated API's

## UserGroups
List groups for a given user

```javascript

client.UserGroups(user_id)
  .then(function(groups){
    console.log(groups)
  })
```

## AuthorBooks
Paginate an author's books

```javascript

client.AuthorBooks(author_id)
  .then(function(books){
    console.log(books)
  })
```

## AuthorId
Get info about an author by id

```javascript

client.AuthorId(author_id)
  .then(function(author_info){
    console.log(author_info)
  })
```

## BookIsbnToId
Get the Goodreads book ID given an ISBN

```javascript

client.BookIsbnToId(isbn)
  .then(function(book_id){
    console.log(book_id)
  })
```

## BookReviewCounts
Get review statistics given a list of ISBNs

```javascript

client.BookReviewCounts(comma_seperated_isbns)
  .then(function(review_stats){
    console.log(review_stats)
  })
```

## BookShow
Get shelves and book meta-data (title, author, et cetera) and reviews for a book given a Goodreads book id

```javascript

client.BookShow(book_id)
  .then(function(book_info){
    console.log(book_info)
  })
```

## ReviewsForBookByIsbn
Get the reviews for a book given an ISBN

```javascript

client.ReviewsForBookByIsbn(isbn)
  .then(function(book_reviews){
    console.log(book_reviews)
  })
```

+All the other Goodreads API's. Documentation is out of date check `lib/client.js` for a full list of supported endpoints.
