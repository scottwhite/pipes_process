/*jshint evil: true, boss: true, node: true*/
var db = function() {
  var mysql = require('mysql'),
      db_config = require('../config').Database,
      _us = require('underscore'),
      config = db_config[process.env.PIPES_ENV || 'staging'];
      console.log(config);
      var pool  = mysql.createPool({user: config.user, password: config.password, database: config.name, connectionLimit:50});

  // var client = mysql.createConnection({user: config.user, password: config.password, database: config.name});


  var handleDisconnect = function(connection){
    connection.on('error', function(err) {
      if (!err.fatal) {
        console.error("Non fatal error return from handler which is wrong behavior");
        console.error(err.code);
        return;
      }

      if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
        console.error(err.code);
        throw err;
      }

      console.log('Re-connecting lost connection: ' + err.stack);

      connection = mysql.createConnection(connection.config);
      handleDisconnect(connection);
      connection.connect();
    });
  };
  // handleDisconnect(client);



  var connect_and_select = function(sql,values,callback){
    pool.getConnection(function(err,connection){
        if(err) throw err;
        connection.on('error',function(err){
          console.error(err.code);
          console.error(error.stack);
        });
        connection.query(
          sql,values,
          function(err,results,fields){
            callback(err,results,fields);
            connection.end();
          }
        );
      });
  };

  return {
    client: pool,
    user_phones: function(callback){
        var sql = 'SELECT users.email, user_phones.number, user_phones.created_at, user_phones.updated_at ' +
          'from user_phones INNER JOIN users on user_phones.user_id = users.id ' + 
          'ORDER BY users.email';
          connect_and_select(sql,null,
          function select_cb(err,results,fields){
              callback(err,results);
          });
    },
    
    phone_by_id: function(pid,callback){
        var sql = 'SELECT did_id, pipes_number, user_number, provider_id, time_left from did_mappings ' +
        'where did_id = ? ' +
        'and time_left > 0';
        connect_and_select(sql,[pid],
        function select_cb(err,results,fields){
          if(!results){
            callback(err,results);
          }
          
          var r = results[0];
          callback(err,r);
        });
    },
    phone_by_number: function(pn,callback){
      var phone_max = 10;
      if(pn.length > phone_max){
        pn = pn.substr(pn.length -phone_max, phone_max);
      }
        var sql = 'SELECT did_id, pipes_number, user_number, provider_id, time_left from did_mappings ' +
        'where pipes_number= ? ' +
        'and time_left > 0';
        var values = [pn];
        connect_and_select(sql,values,
        function select_cb(err,results,fields){
          var r = results[0];
          callback(err,r);
        });
    },
    blocked_phones: function(id, callback){
        connect_and_select('SELECT number,time_left from did_mappings ' +
        'where phone_number = ? and time_left > 0', [id],
        function select_cb(err,results,fields){
          var r = results[0];
          callback(err,r);
        }        
      );      
    },
    update_call_usage: function(id, billable_seconds,callback){
          var sql = 'UPDATE did_mappings set current_usage = current_usage + ? ' +
          'where did_id = ?';
          var values = [billable_seconds, id];
          connect_and_select(sql,values,
            function update_cb(err, results, fields) {
            if (err) {
              throw err;
            }
            callback(err,results.affectedRows);
          });
    },
    insert_call_log: function(log,callback){
         var sql = 'insert into  call_logs (call_sid,calling_number,pipes_number,target_number,duration,status) values (?,?,?,?,?,?)';
         var values = _us(log).values();
         connect_and_select(sql,values,
          function update_cb(err, results, fields) {
           if (err) {
             throw err;
           }
           callback(err,results.affectedRows);
         });
    },
    insert_request_token: function(id, token,callback){
      connect_and_select('insert into request_tokens (did_id, token) values(?,?)',
         [id,token],
         function update_cb(err, results, fields) {
           if (err) {
             throw err;
           }
           callback(err,token);
         }
       );      
    },
    has_token_with_did: function(did_id, token,callback){
      var sql = 'SELECT id, token, did_id from request_tokens ' +
        'where did_id = ?  and token = ?';
      var values = [did_id, token];
      connect_and_select(sql,values,
        function select_cb(err,results,fields){
          if(!results){
            callback(err,results);
          }
          callback(err,true);
        });
    },
    delete_request_token: function(did_id, token, callback){
         connect_and_select('delete from request_tokens where did_id = ? and token = ?',
         [did_id, token],
         function update_cb(err, results, fields) {
           if (err) {
             throw err;
           }
           callback(err,results.affectedRows);
         }
       );
    }
    
  };
};

module.exports=db;