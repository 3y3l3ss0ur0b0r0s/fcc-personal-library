/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

// --------------------------------------------------
// Requiring Mongoose for database actions
const mongoose = require('mongoose');
// Connect to MongoDB database using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// --------------------------------------------------

module.exports = function (app, myDataBase) {

  // --------------------------------------------------
  // Schemas
  const Schema = mongoose.Schema;
  const bookSchema = new Schema({
    title: String,
    comments: [String],
    commentcount: Number
  });
  const Book = mongoose.model("Book", bookSchema);
  // --------------------------------------------------
  // Route to delete all (for testing purposes)
  app.route('/api/DESTROY_ALL')
    .get((req, res) => {
      // Set start count
      let startCount;
      Book.count({}).then((theBooks) => { startCount = theBooks.length });
      // Start deleting
      Book.deleteMany()
        .then(() => {
          Book.count({})
            .then((theBooks) => {
              console.log(theBooks);
              let endCount = theBooks.length;
              console.log("Total books: " + endCount);
              // Send info in response
              res.send({
                message: "All books deleted.",
                startCount: startCount,
                endCount: endCount
              });  // End res.send()
            });  // End Book.count({}).then()
        });  // End Book.deleteMany().then()
    }); // End app.route().delete()
  // --------------------------------------------------

  // You can send a GET request to /api/books and receive a JSON response representing all the books. 
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      // --------------------------------------------------
      console.log("In app.route('/api/books').get()...");
      let bookList = [];
      Book.find({})
        //.select('_id title commentcount')
        .then((theBooks) => {
          console.log("\n.get(): " + theBooks);
          res.send(theBooks);
        });
      // --------------------------------------------------
    })

    // You can send a POST request to /api/books with title as part of the form data to add a book. 
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      // --------------------------------------------------
      console.log("In app.route('/api/books').post()...");
      console.log("title: " + title);
      if(title != "" && title != null) {
        let someBook = new Book({
          title: title,
          commentcount: 0,
          comments: []
        });
        someBook.save();
        console.log("\n.post(): " + someBook);
        // The returned response will be an object with the title and a unique _id as keys.
        console.log(".post(): sending object with title: " + someBook.title + " and _id: " + someBook._id);
        /*res.send({
          title: someBook.title,
          _id: someBook._id
        });*/
        res.send(someBook);
      } else {
        // If title is not included in the request, the returned response should be the string missing required field title.
        console.log(".post(): missing required field title");
        res.send("missing required field title");
      }
      // --------------------------------------------------
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      // --------------------------------------------------
      console.log("In app.route('/api/books').delete()...");
      Book.deleteMany()
        .then((result) => {
          Book.count({})
            .then((count) => {
              // The returned response will be the string complete delete successful if successful.
              if(count == 0) {
                console.log(".delete(): complete delete successful");
                res.send("complete delete successful");
              }
            });  // End book.count({}).then()
          });  // End Book.deleteMany().then()
      // --------------------------------------------------
    });


  // You can send a GET request to /api/books/{_id} to retrieve a single object of a book containing the properties title, _id, and a comments array (empty array if no comments present).
  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      // --------------------------------------------------
      console.log("In app.route('/api/books/:id').get()...");
      Book.findById(bookid)
        .then((theBook) => {
          console.log("\n.get() (by _id): " + theBook);
          if(theBook != null) {
            res.send(theBook);
          } else {
            // If no book is found, return the string no book exists.
            console.log(".findById(): no book exists");
            res.send("no book exists");
          }
        });
      // --------------------------------------------------
    })

    // You can send a POST request containing comment as the form body data to /api/books/{_id} to add a comment to a book.
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      // --------------------------------------------------
      console.log("In app.route('/api/books/:id').get()...");
      if(comment == '' || comment == null) {
        console.log(".post(): missing required field comment")
        res.send("missing required field comment");
      } else {
        Book.findById(bookid)
          .then((theBook) => {
            if(theBook != null) {
              theBook.comments.push(comment);
              theBook.commentcount++;
              theBook.save();
              console.log(theBook);
              // The returned response will be the books object similar to GET /api/books/{_id} request in an earlier test. 
              res.send(theBook);
            } else {
              // If no book is found, return the string no book exists.
              console.log(".post(): no book exists");
              res.send("no book exists");
            } // End if-else checking if book is found
          }); // End Book.findById()
      } // End if-else checking for comment
      // --------------------------------------------------
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      // --------------------------------------------------
      console.log("In app.route('/api/books:id').delete()...");
      console.log("_id provided: " + bookid);
      Book.deleteOne({_id: bookid})
        .then((result) => {
          // The returned response will be the string delete successful
          if(result.acknowledged && result.deletedCount == 1) { 
            console.log("Delete successful!")
            res.send("delete successful");
          } else if(result.deletedCount == 0) {
            // If no book is found, return the string no book exists.
            console.log(".delete(): no book exists");
            res.send("no book exists");
          }
        })
      // --------------------------------------------------
    });
  
};
