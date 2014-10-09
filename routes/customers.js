
/*
 * GET users listing.
 */

exports.login = function(req, res){
    var messages = '';
    if(req.session.username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.logout = function(req, res){
    var username = req.session.username;
    if( username ){
        var userid = req.session.userId;
        req.getConnection(function (err, connection) {
            connection.query("DELETE FROM onlineusers  WHERE userid = ? ",[userid], function(err, rows)
            {
                if(err)
                     console.log("Error deleting : %s ",err );
                else{
                    var messages = '';
                    req.session.username = null;
                    delete req.session.username;
                    req.session.destroy();
                    res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
                }
            });
        });
    } else {
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
    
};

exports.signup = function(req, res){
    var username = '';
    if(username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('signup',{page_title:"Sign Up",message: messages});
    }
};
exports.checklogin = function(req,res){
    var loginInput = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var uname    = loginInput.username;
        var pswd        = loginInput.pswd;
        var query = connection.query("SELECT * FROM users WHERE username = ? AND pswd = ? ",[uname,pswd], function(err,rows)
        {
            if (err){
                console.log("Error Fetching : %s ",err );
                console.log("",query );
            }    
            else{
                if (rows.length > 0) {
                    var id = rows[0].id;
                    var userRole = rows[0].userrole;
                    req.session.userRoleId = userRole;
                    req.session.userId = id;
                    req.session.username = uname;
                    if(req.session.userRoleId === 1){
                        req.session.role = 'admin';
                    }else{
                        req.session.role = 'normal';
                    }
                    connection.query('SELECT userid FROM onlineusers WHERE userid = ? ',[req.session.userId],function(err,rows)
                    {
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        if ( rows.length <= 0 ) {
                            var onlineUsersData = {
                                username : req.session.username,
                                userid   : req.session.userId
                            };
                            var query2 = connection.query("INSERT INTO onlineusers SET ? ",onlineUsersData, function(err, result)
                            {
                                if (err){
                                    console.log("Error inserting : %s ",err );
                                }else{
                                    //console.log(query2.sql);
                                    res.render('dashboard',{page_title:"Welcome to Customer Center",message: messages});
                                }
                            });
                        } else {
                            res.render('dashboard',{page_title:"Welcome to Customer Center",message: messages});
                        }
                    });
                }
                else{
                    var messages = 'Username/Password is wrong. Try again.';
                    res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
                }
            }
        });
    });
};

exports.profile = function(req, res){
    var username = req.session.username;
    var userid = req.session.userId;
    var displayUserName = '';
    var displaymessage = '';
    var displayFullmessage = '';
    var usermessage = [];
    var senderIds = '';
    var count = 0;
    var cssClass;
    if(username){
        req.getConnection(function(err,connection){
            connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,profiledata)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                else {
                    connection.query('SELECT DISTINCT `customer`.`name`,users.username,users.id FROM `users` \n\
                    LEFT JOIN customer on `customer`.`userid` = users.id \n\
                    Left Join privatemessage ON senderuserid = users.id OR reciveruserid = users.id \n\
                    WHERE senderuserid = ? OR reciveruserid = ? ',[userid,userid],function(err,rows)
                    {
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        else{
                            if(rows.length > 0){
                                for(var i = 0; i < rows.length; i++){
                                    var senderName = rows[i].name;
                                    var senderId = rows[i].id;
                                    if(senderId === userid){
                                       
                                    } else {
                                        senderIds = senderId;
                                        
                                        displayUserName = "<a href='#user-"+senderId+"'><div class='username'>"+senderName+"</div></a>";
                                        connection.query(' SELECT * FROM `privatemessage` \n\
                                        LEFT JOIN customer ON `customer`.`userid` = `senderuserid`\n\
                                        WHERE (`senderuserid` = ? AND `reciveruserid` = ?) or (`senderuserid` = ? AND `reciveruserid` = ?) ORDER BY `privatemessage`.`id` ASC ',[senderIds,userid,userid,senderIds],function(err,messageResult)
                                        {
                                            if(err)
                                                console.log("Error Selecting : %s ",err );
                                            else {
                                                if(messageResult.length > 0){
                                                    for(var j= 0; j < messageResult.length; j++) {
                                                        if(messageResult[j].userid === userid){
                                                            cssClass = "left";
                                                        } else {
                                                            cssClass = "left";
                                                        }
                                                        displaymessage += "<div class='"+cssClass+"'><span><a href='/customers/userprofile/"+
                                                                messageResult[j].userid+"'>"+messageResult[j].name+
                                                                "</a></span><span class='messageTime'>"+messageResult[j].messagetime+
                                                                "</span><div class='privateSingleMessage'>"+messageResult[j].message+
                                                                "</div></div>";
                                                    }
                                                }
                                                displayFullmessage = "<div class='privateUserMessage' id='user-"+senderId+"'>"+
                                                        displaymessage+"</div>";
                                                
                                                usermessage[count] = {
                                                    msguserid: senderIds,
                                                    username : displayUserName,
                                                    message : displayFullmessage
                                                };
                                                count++;
                                                if(i === rows.length){
                                                    console.log(usermessage);
                                                    res.render('profile',{page_title:"My Profile",data:profiledata,globalMessage: messages,usersmessage: usermessage});
                                                } else {
                                                    
                                                }
                                            }
                                        });
                                    }
                                }
                            } else {
                                usermessage[0] = {
                                    username : '',
                                    message : 'No Message To Display'
                                };
                                console.log(usermessage);
                               res.render('profile',{page_title:"My Profile",data:profiledata,globalMessage: messages,usersmessage: usermessage});
                            }
                        }
                    });
                }
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.lostpassword = function(req, res){
    var messages = '';
    if(req.session.username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('lostpassword',{page_title:"Lost Password",message: messages});
    }
};
exports.checklostpassword = function(req,res){
    var lostPasswordInput = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var email    = lostPasswordInput.email;
        var query = connection.query("SELECT email FROM customer WHERE email = ? ",[email], function(err,rows)
        {
            if (err){
                console.log("Error Fetching : %s ",err );
                console.log("",query );
            }    
            else{
                if (rows.length > 0) {
                    var messages = "Check your e-mail for the confirmation link.";
                    res.render('login',{page_title:"Welcome to Customer Center",message: messages});
                }
                else{
                    var messages = 'There is no user registered with that email address.';
                    res.render('lostpassword',{page_title:"Welcome to Customer Centre",message: messages});
                }
            }
        });
    });
};

exports.dashboard = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('dashboard',{page_title:"Dashboard",message: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
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
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.add = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('add_customer',{page_title:"Add Customers"});
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.changePassword = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('changepassword',{page_title:"Change Password",message: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.changePasswordCheck = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    var pswd = input.pswd;
    var rPswd = input.rpeatPswd;
    var userid = req.session.userId;
    var username = req.session.username;
    if(username){
        if( pswd != rPswd ){
            messages = "Password Do not Match.";
            res.render('changepassword',{page_title:"Change Password",message: messages});
        } else {
            var length = pswd.length;
            if( length < 8 ){
                messages = "Password characters must be 8 or more";
                res.render('changepassword',{page_title:"Change Password",message: messages});
            }else{
                req.getConnection(function(err,connection){
                    var data = {
                        pswd : pswd
                    };
                    var query = connection.query("UPDATE users set ? WHERE id = ? ",[data,userid], function(err, rows)
                    {
                        if (err)
                            console.log("Error Updating : %s ",err );
                        var messageData = {
                            message : "Password Successfully Changed",
                            class : "successMessage"
                        };
                        connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
                        {
                            if(err)
                                console.log("Error Selecting : %s ",err );
                            else
                                res.render('profile',{page_title:"My Profile",data:rows,globalMessage: messageData});
                        });
                    });
                });
            }
        }
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
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
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
     
};

/*Save the customer*/
exports.save_customer = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var username = input.name.toLowerCase().replace(/ /g, '');
        var loginDate = {
            username : username,
            pswd : username,
            userrole: input.user_role
        };
        var query = connection.query("INSERT INTO users set ? ",loginDate, function(err, result)
        {
            if (err){
                console.log("Error inserting : %s ",err );
            }else{
                var lastInsertId = result.insertId;
                var customerInfo = {
                    name    : input.name,
                    address : input.address,
                    email   : input.email,
                    phone   : input.phone,
                    userid  : lastInsertId
                };
                var query2 = connection.query("INSERT INTO customer set ? ",customerInfo, function(err, result)
                {
                    if (err){
                        console.log("Error inserting : %s ",err );
                    }else{
                        //console.log(query2.sql);
                        res.redirect('/customers/view');
                    }
                });
            }
        });
    });
};

exports.save_edit = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    var userid = req.session.userId;
    req.getConnection(function (err, connection) {
        var data = {
            address : input.address,
            email   : input.email,
            phone   : input.phone,
            aboutme : input.aboutMe,
            fbLink : input.fbLink,
            twLink : input.twLink,
            liLink : input.liLink
        };
        connection.query("UPDATE customer set ? WHERE id = ? ",[data,id], function(err, rows)
        {
            if (err)
              console.log("Error Updating : %s ",err );
            var messageData = {
                message : "Profile Successfully Updated",
                class : "successMessage"
            };
            connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                else
                    res.render('profile',{page_title:"My Profile",data:rows,globalMessage: messageData});
            });
        });
    });
};


exports.delete_customer = function(req,res){
    var username = req.session.username;
    if(username){
        var id = req.params.id;
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT userid FROM customer WHERE id = ?',[id],function(err,rows)
            {
                if(err){
                    console.log("Error Selecting : %s ",err );
                }
                else{
                    var userid = rows[0].userid;
                    connection.query("DELETE FROM customer  WHERE id = ? ",[id], function(err, rows)
                    {
                        if(err)
                             console.log("Error deleting : %s ",err );
                        else{
                            connection.query("DELETE FROM users  WHERE id = ? ",[userid], function(err, rows)
                            {
                                if(err)
                                     console.log("Error deleting : %s ",err );
                                else{
                                    var query = connection.query('SELECT * FROM customer',function(err,rows)
                                    {
                                        if(err){
                                            console.log("Error Selecting : %s ",err );
                                        }else{
                                            res.render('list_customer',{page_title:"Customers",data:rows});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.profilepic = function(req, res){
    var username = req.session.username;
    if(username){
        res.render('profilepic',{page_title:"Add Customers",globalMessage: messages});
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.profileupolad = function(req, res){
    var userid = req.session.userId;
    var username = req.session.username;
    if(username){
        var fs = require('fs');
        req.getConnection(function(err,connection){
            connection.query('SELECT profilepicture,picturetype FROM customer WHERE userid = ?',[userid],function(err,rows)
            {
                var pictureName = rows[0].profilepicture;
                var pictureType = rows[0].picturetype;
                var oldprofilepic = "./public/images/profile/"+pictureName+"."+pictureType;
                if(pictureName !== 0){
                    fs.unlink(oldprofilepic, function(err){
                        if(err) throw err;
                    });
                }
                fs.readFile(req.files.profilePic.path, function (err, data) {
                    connection.query('SELECT profilepicture FROM customer ORDER BY profilepicture DESC LIMIT 1 ',function(err,rows)
                    {
                        var pictureNewName = '';
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        var pictureName = rows[0].profilepicture;
                        if( pictureName === 0 ) {
                            pictureNewName = 1;
                        } else {
                            pictureNewName = Number(pictureName)+Number(1);
                        }
                        var pictureType= req.files.profilePic.type;
                        var parts = pictureType.split('/', 2);
                        var type  = parts[1];
                        if( type === 'png' || type === 'jpeg' || type === 'gif' ){
                            var newPath = "./public/images/profile/"+pictureNewName+"."+type;
                            fs.writeFile(newPath, data, function (err) {
                                if (err) throw err;
                                fs.unlink(req.files.profilePic.path, function(err){
                                    if(err) throw err;
                                });
                                data = {
                                    profilepicture : pictureNewName,
                                    picturetype    : type
                                };
                                connection.query("UPDATE customer set ? WHERE userid = ? ",[data,userid], function(err, rows)
                                {
                                    if (err)
                                      console.log("Error Updating : %s ",err );
                                    var messageData = {
                                        message : "Profile Picture Successfully Changed",
                                        class : "successMessage"
                                    };
                                    connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
                                    {
                                        if(err)
                                            console.log("Error Selecting : %s ",err );
                                        else
                                            res.render('profile',{page_title:"My Profile",data:rows,globalMessage: messageData});
                                    });
                                });
                            });
                        } else {
                            var messageData = {
                                message : "Please upload only png, jpg or gif type image",
                                class : "errorMessage"
                            };
                            res.render('profilepic',{page_title:"Add Customers",globalMessage: messageData});
                        }
                    });
                });
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.chat = function(req, res){
    var username = req.session.username;
    if(username){
        var messageData = '';
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT * FROM onlineusers',function(err,onlineusers)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var query = connection.query('SELECT * FROM chatmessage',function(err,usermessages)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    res.render('chat',{page_title:"Add Customers",globalMessage: messageData,data:onlineusers,chatmessage:usermessages});
                });
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.chatCheck = function(req, res){
    var username = req.session.username;
    if(username){
        var chatMessageInput = JSON.parse(JSON.stringify(req.body));
        var messageData = '';
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT * FROM onlineusers',function(err,onlineusers)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                var chatMessage = {
                    userid : chatMessageInput.userid,
                    username : chatMessageInput.username,
                    chatText : chatMessageInput.message
                };
                var query2 = connection.query("INSERT INTO chatmessage SET ? ",chatMessage, function(err, result)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    var query = connection.query('SELECT * FROM chatmessage',function(err,usermessages)
                    {
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        res.render('chat',{page_title:"Add Customers",globalMessage: messageData,data:onlineusers,chatmessage:usermessages});
                    });
                    
                });
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.clearchat = function(req, res){
    var username = req.session.username;
    if(username){
        var messageData = '';
        req.getConnection(function(err,connection){
            connection.query("DELETE FROM chatmessage ", function(err, rows)
            {
                if(err)
                     console.log("Error deleting : %s ",err );
                else{
                    var query = connection.query('SELECT * FROM onlineusers',function(err,onlineusers)
                    {
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        var query = connection.query('SELECT * FROM chatmessage',function(err,usermessages)
                        {
                            if(err)
                                console.log("Error Selecting : %s ",err );
                            res.render('chat',{page_title:"Add Customers",globalMessage: messageData,data:onlineusers,chatmessage:usermessages});
                        });
                    });
                }
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

exports.userprofile = function(req, res){
    var username = req.session.username;
    var userid = req.params.id;
    if(username){
        req.getConnection(function(err,connection){
            var query = connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                else
                    
                    
                    res.render('userprofile',{page_title:rows[0].name,data:rows,globalMessage: messages});
             });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};


exports.privatemessage = function(req, res){
    var username = req.session.username;
    var userid = req.params.id;
    if(username){
        req.getConnection(function(err,connection){
            var privateMessageInput = JSON.parse(JSON.stringify(req.body));
            var currentTime = getDateTime();
            var privateMessage = {
                senderuserid : req.session.userId,
                reciveruserid : privateMessageInput.sentto,
                message : privateMessageInput.message,
                messagetime : currentTime
            };
            var sender = req.session.userId;
            var receiver = privateMessageInput.sentto;
            connection.query('SELECT id FROM conversation WHERE (sender = ? AND  receiver = ?) OR (sender = ? AND receiver = ?)',[sender,receiver,receiver,sender],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                else
                    if (rows.length <= 0) {
                        var data = {
                            sender : req.session.userId,
                            receiver : privateMessageInput.sentto,
                            lastmessage : req.session.userId
                        };
                        connection.query("INSERT INTO conversation set ? ",data, function(err, result)
                        {
                            if(err)
                                console.log("Error Selecting : %s ",err );
                        });
                    } else {
                        var conversationId = rows[0].id;
                        var data = {
                            lastmessage : req.session.userId
                        };
                        var query = connection.query("UPDATE conversation set ? WHERE id = ?",[data,conversationId], function(err, result)
                        {
                            if(err)
                                console.log("Error Selecting : %s ",err );
                        });
                    }
                connection.query("INSERT INTO privatemessage SET ? ",privateMessage, function(err, result)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );
                    var messageData = {
                        message : "Message Sent",
                        class : "successMessage"
                    };
                    connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
                    {
                        if(err)
                            console.log("Error Selecting : %s ",err );
                        else
                            res.render('userprofile',{page_title:rows[0].name,data:rows,globalMessage: messageData});
                    });
                });
            });
        });
    }else{
        var messages = '';
        res.render('login',{page_title:"Welcome to Customer Centre",message: messages});
    }
};

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
//    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    return hour + ":" + min + " "+ day + "/" + month + "/" + year ;

}

function getprivateMessage(req,err, userid){
    req.getConnection(function(err,connection){
        connection.query('SELECT * FROM customer WHERE userid = ?',[userid],function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            else
                return rows;
        });
    });
}
