var informix = require('informixdb');
 
informix.open("SERVER=dbServerName; DATABASE=dbName; HOST=hostName; SERVICE=port; UID=userID; PWD=password;", function (err,conn) {
  if (err) return console.log(err);
  
  conn.query('select 1 from table(set{1})', function (err, data) {
    if (err) console.log(err);
    else console.log(data);
 
    conn.close(function () {
      console.log('done');
    });
  });
});