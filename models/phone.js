/*jshint evil: true, boss: true, node: true, devel: true*/
/*global  require _*/

var Pipes = {},
    Db = require('./db'),
    _db = new Db(),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    _us = require('underscore');


var phone = function(number) {
  var self = this;
  self.db = _db;
  EventEmitter.call(this);
  
  var properties_from_db = function(err,phone_hash){
    if(err){
      throw err;
    }
    if(phone_hash){
      _us(self).extend(phone_hash);
      //node convention of error being 1st arg
      self.emit('ready',null,self);      
    }else{
      self.emit('empty',null,self);
    }
  };
  
  var send_update_event = function(err,result){
    if(!err){
      self.emit('update',null,result);
    }else{
      self.emit('failed',err, null);
    }  
  };

  var send_insert_event = function(err,result){
    if(!err){
      self.emit('insert',null,result);
    }else{
      self.emit('failed',err, null);
    }  
  };
  
  var update_time = function(time_used_secs){
    self.db.update_call_usage(self.id,time_used_secs,send_update_event);
    return self;
  };
  
  var enter_call = function(call_info){
    var call_log = {
      call_sid: call_info.CallSid,
      calling_number: call_info.From,
      // pipes_number: call_info.Called,
      pipes_number: self.pipes_number,
      target_number: self.user_number,
      duration: call_info.DialCallDuration || call_info.CallDuration,
      status: call_info.DialCallStatus || call_info.CallStatus
    };
    self.db.insert_call_log(call_log,send_update_event);
    return self;
  };
  
  var block_caller = function(pipes_number){
    // select 1 as block from call_logs c
    // inner join dids d
    // on d.phone_number = c.pipes_number
    // and c.pipes_number = ?
    // inner join dids_user_phones dup
    // on dup.did_id = d.id
    // and dup.expire_state = 2
    // and date_add(dup.expiration_date, INTERVAL 3 WEEK) > NOW();
  };
  
  var is_active = function(){
    
  };


  var convert = function(number){
    if(number && !number.match(/^\+1/)){
      number = "+1" + number;
    }
    return number;
  };
  
  var attributes = function(){
    return _us(self).keys();
  };

  // self.id = id;
  self.attributes = attributes;
  self.find_phone = this.db.find_phone;
  self.is_active = is_active;
  self.update_time = update_time;
  self.block_caller = block_caller;
  self.enter_call = enter_call;
  self.convert = convert;
  if (number) {
    // look it up
    _db.phone_by_number(number,properties_from_db);
  }
  return self;
};

util.inherits(phone, EventEmitter);

module.exports = phone;



