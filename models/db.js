/*jshint evil: true, boss: true, node: true*/
var db = function() {
  var Client = require('mysql'),
      config = require('../config').Database,
      _us = require('underscore');
  client = Client.createConnection({user: config.user, password: config.password, database: config.name});
    
  return {
    client: client,
    user_phones: function(callback){
      return client.query(
          'SELECT users.email, user_phones.number, user_phones.created_at, user_phones.updated_at ' +
          'from user_phones INNER JOIN users on user_phones.user_id = users.id ' + 
          'ORDER BY users.email',
          function select_cb(err,results,fields){
              callback(err,results);
          }
        );
    },
    
    phone_by_id: function(pid,callback){
      return client.query(
        'SELECT pipes_number, user_number, provider_id, time_left * 1000 as time_left from did_mappings ' +
        'where did_id = ? ' +
        'and time_left > 0', [pid],
        function select_cb(err,results,fields){
          if(!results){
            callback(err,results);
          }
          
          var r = results[0];
          callback(err,r);
        }
      );
    },
    phone_by_number: function(pn,callback){
      var phone_max = 10;
      if(pn.length > phone_max){
        pn = pn.substr(pn.length -phone_max, phone_max);
      }
      return client.query(
        'SELECT pipes_number, user_number, provider_id, time_left * 1000 as time_left from did_mappings ' +
        'where pipes_number= ? ' +
        'and time_left > 0', [pn],
        function select_cb(err,results,fields){
          var r = results[0];
          callback(err,r);
        }        
      );
    },
    blocked_phones: function(id, callback){
      return client.query(
        'SELECT number, time_left * 1000 as time_left from did_mappings ' +
        'where phone_number = ? and time_left > 0', [id],
        function select_cb(err,results,fields){
          var r = results[0];
          callback(err,r);
        }        
      );      
    },
    update_call_usage: function(id, billable_seconds,callback){
       return client.query(
          'UPDATE did_mappings set current_usage = current_usage + ? ' +
          'where did_id = ?',
          [billable_seconds, id],
          function update_cb(err, results, fields) {
            if (err) {
              throw err;
            }
            callback(err,results.affectedRows);
          }
        );
    },
    insert_call_log: function(log,callback){
      return client.query(
         'insert into  call_logs (call_sid,calling_number,pipes_number,target_number,duration,status) values (?,?,?,?,?,?)',
         _us(log).values(),
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