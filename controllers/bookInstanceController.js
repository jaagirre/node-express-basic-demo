var async = require('async');
var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');



// Display list of all BookInstances
exports.bookinstance_list = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance list');
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_book_instances){
                res.render('book_instances', {title:'Book Copies List', book_instances: list_book_instances});
        });

};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('book_instance_detail', { title: 'Book:', bookinstance: bookinstance });
    });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance create GET');
    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('book_instance_form', {title: 'Create BookInstance', book_list:books});
    });


    
  
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance create POST');
    req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('imprint', 'Imprint must be specified').notEmpty();
   // req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
    //req.sanitize('due_back').toDate();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back
    });

    console.log('BOOK INSTANCE' + bookinstance);

    var errors = req.validationErrors();
    if (errors) {
        
        Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(); }
          //Successful, so render
          res.render('book_instance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors, bookinstance:bookinstance });
        });
        return;
    } 
    else {
    // Data from form is valid
    
        bookinstance.save(function (err) {
            if (err) { 
                console.log('ERROREA!!'+ err);
                
                return next(err); 
            }
            //successful - redirect to new book-instance record.
            res.redirect(bookinstance.url);
        }); 
    }

};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance delete GET');
   //hay que buscar la informacion de este 
   BookInstance.findById(req.params.id)
   .populate('book')
   .exec(function (err, bookinstance) {
     if (err) { return next(err); }
     //Successful, so render
     res.render('book_instance_delete', { title: 'Book:', bookinstance: bookinstance });
   });
   
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance delete POST');
      //Author has no books. Delete object and redirect to the list of authors.
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteAuthor(err) {
        if (err) { return next(err); }
        //Success - got to author list
        res.redirect('/catalog/bookinstances');
    });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance update GET');
    //tengo que rrebviarlo al formulario del libro pero con informacion
    //no hace falta nada paralelo ya que no tiene mas datos
    //la idea es poder cambiar el estadp
    console.log('REQ' + req.params.id)
    req.sanitize('id').escape();
    req.sanitize('id').trim(); 
    console.log('REQ' + req.params.id)
    async.parallel({
        bookinstance:function(callback){
            BookInstance.findById(req.params.id)
            .populate('book')
            .exec(callback);
        },
        books: function(callback){
            Book.find({},'title')
            .exec(callback);
        }
    },
        function(err, results){
            if (err) { 
                console.log('error:'+err);
                return next(err);
            }
            res.render('book_instance_form', { title: 'Book copy:', bookinstance: results.bookinstance , book_list:results.books });
        }
    );
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: BookInstance update POST');
    //aqui ahora actualizamos la base de datos
    //ahora tenemos que actualizar partiendo de los datos del formulario, es parecido al insert

    //res.send('NOT IMPLEMENTED: BookInstance create POST');
    req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('imprint', 'Imprint must be specified').notEmpty();
    // req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
    //req.sanitize('due_back').toDate();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back,
        _id:req.params.id //This is required, or a new ID will be assigned!
    });

    console.log('BOOK INSTANCE' + bookinstance);

    var errors = req.validationErrors();
    if (errors) {
        
        Book.find({},'title')
        .exec(function (err, books) {
        if (err) { return next(); }
        //Successful, so render
        res.render('book_instance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors, bookinstance:bookinstance });
        });
        return;
    } 
    else {
        // Data from form is valid
        console.log('A actualizar BOOK instance');
        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,bookinstance) {
            if (err) { 
                console.log('ERROR'+err);
                return next(err); }
            //successful - redirect to book detail page.
            res.redirect(bookinstance.url);
        });
    }

    /*
    else {
        // Data from form is valid. Update the record.
        Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
            if (err) { return next(err); }
            //successful - redirect to book detail page.
            res.redirect(thebook.url);
        });
    }
    */
};