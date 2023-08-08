/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  *//*
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  *//*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    let validId; 

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books?title=Wood%20Varieties%20for%20Woodworkers')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check title
            assert.isDefined(res.body.title, 'res.body.title should be defined');
            assert.notEqual(res.body.title, '', 'res.body.title should not be an empty string');
            // 2. Check if "_id" property exists
            assert.property(res.body, '_id', 'res.body should have a property called "_id"');
            // 3. Check if "commentcount" property exists
            assert.property(res.body, 'commentcount', 'res.body should have a property called "commentcount"');
            // 4. Check if "comments" property is an array
            assert.isArray(res.body.comments, 'res.body.comments should be an array');

            // 5. If _id is valid, then set that to "validId to use for other tests"
            validId = res.body._id;
            console.log("validId: " + res.body._id);
          });
          done();
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books?title=')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "missing required field title" is returned
            assert.equal(res.body, 'missing required field title', 'submitting a book without a title should return a response string "missing required field title"');
          });
          done();
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if returned response is an array
            assert.isArray(res.body, 'returned body should be an array');
            // 2. Check if each item in the response has the required properties
            for(item in res.body) {
              assert.property(item, 'title', 'each book object should have a "title" property');
              assert.property(item, '_id', 'each book object should have an "_id" property');
              assert.property(item, 'commentcount', 'each book object should have a "commentcount" property');
              assert.property(item, 'comments', 'each book object should have a "comments" property');
              assert.isArray(item.comments, 'the "comments" property should be an array');
            }
          });
          done();
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/id=4206969')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "no book exists" is returned
            assert.equal(res.body, 'no book exists', 'attempt to get an book with a nonexistent _id should return string "no book exists"');
          });
          done();
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/id=' + validId)
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check title
            assert.isDefined(res.body.title, 'res.body.title should be defined');
            assert.notEqual(res.body.title, '', 'res.body.title should not be an empty string');
            // 2. Check if "_id" property is equal to validId
            assert.equal(res.body._id, validId, ('res.body._id should equal ' + validId));
            // 3. Check if "comments" property is an array
            assert.isArray(res.body.comments, 'res.body.comments should be an array');
          });
          done();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/id=' + validId + '?comment=interesting%20read')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if the comment was added to the book
            assert.include(res.body.comments, 'interestng read', 'the book object should have the newly submitted comment added to its "comment" array');
          });
          done();
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post('/api/books/id=' + validId)
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "missing required field comment" is returned
            assert.equal(res.body, 'missing required field comment', 'attempting to submit a comment without text should return a response string "missing required field comment"');
          });
          done();
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/id=4206969?comment=cool%20book')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "no book exists" is returned
            assert.equal(res.body, 'no book exists', 'attempting to submit a comment without a valid _id should return a response string "no book exists"');
          });
          done();
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete('/api/books/' + validId)
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "delete successful" is returned
            assert.equal(res.body, 'delete successful', 'successful deletion of a book object by _id should return a response string "delete successful"');
          });
          done();
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/id=4206969?comment=cool%20book')
          .end((err, res) => {
            assert.equal(res.status, 200);
            // 1. Check if string "no book exists" is returned
            assert.equal(res.body, 'no book exists', 'unsuccessful attempt to delete a book object by _id should return a response string "no book exists"');
          });
          done();
      });

    });

  });

});
