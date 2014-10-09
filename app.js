
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var busboy = require('connect-busboy');
//load customers route
var customers = require('./routes/customers'); 
var app = express();


var connection  = require('express-myconnection'); 
var mysql = require('mysql');

app.use(express.cookieParser('testtest'));
app.use(express.session({
    secret: 'testtest',
    maxAge: 3600000
}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    res.locals.req = req;
    res.locals.res = res;
    next();
});

// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.json());
app.use(require('connect-multiparty')());
app.use(busboy());
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

app.get('/lostpassword', customers.lostpassword);
app.post('/lostpassword', customers.checklostpassword);

app.get('/logout', customers.logout);

app.get('/signup', customers.signup);

app.get('/dashboard', customers.dashboard);

app.get('/customers/profile', customers.profile);

app.get('/customers/userprofile/:id', customers.userprofile);
app.post('/customers/userprofile/:id', customers.privatemessage);

app.get('/customers/chat', customers.chat);
app.post('/customers/chat', customers.chatCheck);

app.get('/customers/clearchat', customers.clearchat);

app.get('/customers/profilepic', customers.profilepic);
app.post('/customers/profilepic', customers.profileupolad);

app.get('/customers/changepassword', customers.changePassword);
app.post('/customers/changepassword', customers.changePasswordCheck);

app.get('/customers/view', customers.list);

app.get('/customers/add', customers.add);
app.post('/customers/add', customers.save_customer);

app.get('/customers/delete/:id', customers.delete_customer);

app.get('/customers/edit/:id', customers.edit);
app.post('/customers/edit/:id',customers.save_edit);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
