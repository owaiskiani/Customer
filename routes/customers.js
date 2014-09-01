
/*
 * GET users listing.
 */

exports.login = function(req, res){
    var username = req.session.username;
    var messages = username;
    if(req.session.username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Login",message: messages});
    }
};

exports.logout = function(req, res){
    var messages = '';
    req.session.destroy();
    req.cookie.destroy();
    res.render('login',{page_title:"Login",message: messages});
    
};

exports.signup = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('signup',{page_title:"Sign Up",message: messages});
    }
};

/*Check Credintial For Login*/
exports.checklogin = function(req,res){
    var loginInput = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var username    = loginInput.username;
        var pswd        = loginInput.pswd;
        var query = connection.query("SELECT * FROM users WHERE username = ? AND pswd = ? ",[username,pswd], function(err,rows)
        {
            if (err){
                console.log("Error Fetching : %s ",err );
                console.log("",query );
            }    
            else{
                if (rows.length > 0) {
                    req.session.username = username;
                    res.render('dashboard',{page_title:"Welcome to Customer Center",message: messages});
                }
                else{
                    var messages = 'Username/Password is wrong. Try again.';
                    res.render('login',{page_title:"Login",message: messages});
                }
            }
        });
    });
};

/*Save the customer*/
exports.save_user = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var data = {
            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone 
        };
        var query = connection.query("INSERT INTO customer set ? ",data, function(err, rows)
        {
            if (err)
                console.log("Error inserting : %s ",err );
            console.log(query.sql);
            res.redirect('/dashboard');
        });
    });
};


exports.dashboard = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Login",message: messages});
    }
    
};

exports.list = function(req, res){
    var username = req.session.username;
    if(username){
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT * FROM customer',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                else
                    res.render('list_customer',{page_title:"Customers",data:rows});
             });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Login",message: messages});
    }
};



exports.add = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('add_customer',{page_title:"Add Customers"});
    }else{
        var messages = '';
        res.render('login',{page_title:"Login",message: messages});
    }
  
};

exports.edit = function(req, res){
    var username = req.session.username;
    if(username){
        var id = req.params.id;
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT * FROM customer WHERE id = ?',[id],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('edit_customer',{page_title:"Edit Customers",data:rows});
             });
             //console.log(query.sql);
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Login",message: messages});
    }
     
};

/*Save the customer*/
exports.save = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var data = {
            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone 
        };
        var query = connection.query("INSERT INTO customer set ? ",data, function(err, rows)
        {
            if (err)
                console.log("Error inserting : %s ",err );
            console.log(query.sql);
            res.redirect('/dashboard');
        });
    });
};

exports.save_edit = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    req.getConnection(function (err, connection) {
        var data = {
            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone 
        };
        connection.query("UPDATE customer set ? WHERE id = ? ",[data,id], function(err, rows)
        {
            if (err)
              console.log("Error Updating : %s ",err );
            res.redirect('/dashboard');
        });
    });
};


exports.delete_customer = function(req,res){   
     var id = req.params.id;
     req.getConnection(function (err, connection) {
        connection.query("DELETE FROM customer  WHERE id = ? ",[id], function(err, rows)
        {
            if(err)
                 console.log("Error deleting : %s ",err );
            else{
                var query = connection.query('SELECT * FROM customer',function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    else
                        res.render('list_customer',{page_title:"Customers",data:rows});
                });
            }
        });
     });
};


