
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

//load customers route
var customers = require('./routes/customers'); 
var app = express();


var connection  = require('express-myconnection'); 
var mysql = require('mysql');

app.use(express.cookieParser('S3CRE7'));
app.use(express.session());


// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/

app.use(
    connection(mysql,{
        host: 'localhost',
        user: 'root',
        password : '',
        //port : 3306, //port mysql
        database:'nodejs'
    },'pool') //or single
);

app.get('/', customers.login);

app.get('/login', customers.login);
app.post('/login', customers.checklogin);

app.get('/logout', customers.logout);

app.get('/signup', customers.signup);
app.post('/signup', customers.save_user);

app.get('/dashboard', customers.dashboard);

app.get('/customers/view', customers.list);

app.get('/customers/add', customers.add);
app.post('/customers/add', customers.save);

app.get('/customers/delete/:id', customers.delete_customer);

app.get('/customers/edit/:id', customers.edit);
app.post('/customers/edit/:id',customers.save_edit);

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
