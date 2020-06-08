var mysql      = require('mysql');
var logger = require('./config/winston')(__filename)
var baseconfig = require('./config/config')

var pool = mysql.createPool({
    connectionLimit : 10,
    acquireTimeout : 120000,
    conneectionTimeout : 120000,
    host     : baseconfig.mysql_host, //'172.17.0.1',
    port     : baseconfig.mysql_port,
    user     : baseconfig.mysql_user,
    password : baseconfig.mysql_password,
    database : baseconfig.mysql_database
});

console.log('[Pool] database');
console.log('host : '+ baseconfig.mysql_host);
console.log('port : '+ baseconfig.mysql_port);
console.log('user : '+ baseconfig.mysql_user);
console.log('database : '+ baseconfig.mysql_database);


pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1')
  });
pool.on('acquire', function (connection) {
    //console.log('Connection %d acquired', connection.threadId);
});
pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
});
pool.on('release', function (connection) {
    //console.log('Connection %d released', connection.threadId);
});

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};


module.exports = getConnection;