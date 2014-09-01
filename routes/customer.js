exports.listCustomer = function(req, res){
    req.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM customer',function(err,rows)
        {
            var customerList = rows;
            return customerList;
        });
    });
    
};