var Phone = require('../models/phone'),
    twilio = require('twilio'),
    config = require('../config').process_url,
    process_url = config[process.env.PIPES_ENV || 'staging'];



// { AccountSid: 'AC584a27ef4e2a013398ad27b5bcdb16a3',
//   ApplicationSid: 'APaebf287000ce4318bee561df1b85f693',
//   Caller: 'client:7',
//   CallStatus: 'completed',
//   Duration: '1',
//   Called: '',
//   To: '',
//   CallDuration: '20',
//   CallSid: 'CA67a899ddc33391e1fd010bb120fb27fc',
//   From: 'client:7',
//   Direction: 'inbound',
//   ApiVersion: '2010-04-01' }

var bill_client_phone = function(body, res) {
    var id = body.Caller.split(':')[1];
    var user_phone = new Phone({type:'id', n: id}); //did phone id
    var time_used = body.Duration*60;
    user_phone.on('ready',function(){
        var what = user_phone.enter_call(body);
        var update = user_phone.update_time(time_used);
        update.on('update',function(){
            console.log('did: ' + id + ' updated time left by ' + time_used);
            return;
        });
        update.on('failed',function(err){
            console.log(err);
        });
    });
};

var call_back_for_billing = function(req,call_sid){
  req.app.get('provider').calls(call_sid).get(function(err,data){
    console.log(data);
  });
}


var client_phone = function(body, res) {
    var id = body.Caller.split(':')[1];
    var user_phone = new Phone({type: 'id', n: id}); //did phone id
    var r = new twilio.TwimlResponse();
    user_phone.on('ready', function() {
        // check target number is not a pipes number, if it is we have to use the real number instead
        Phone.check_existing(body.PhoneNumber, function(err,phone_hash){
            var target_number = phone_hash ? phone_hash.user_number : body.PhoneNumber;
            r.dial({
                action: process_url + '/routed_status',
                timeLimit: user_phone.time_left, callerId: user_phone.pipes_number},
                function(node){node.number(user_phone.convert(target_number))
                });
                console.log(r.toString());
                res.send(r.toString()); 
            });
        });
        
};

// { AccountSid: 'AC584a27ef4e2a013398ad27b5bcdb16a3',
//   ApplicationSid: 'APaebf287000ce4318bee561df1b85f693',
//   Caller: 'client:4',
//   CallStatus: 'ringing',
//   Called: '',
//   To: '',
//   PhoneNumber: '4436188250',
//   CallSid: 'CA9fc34b02d201810e9bcfd9cf0841e244',
//   From: 'client:4',
//   Direction: 'inbound',
//   ApiVersion: '2010-04-01' }

exports.answer = function(req,res){
    console.log(req.body);
    res.set('Content-Type', 'text/xml');
    if(req.body){
        var body = req.body, 
            r;
        try{
            client_phone(body,res);
        }catch(e){
            r = new twilio.TwimlResponse();
            r.say('Not working, hanging up').hangup();
            res.send(r.toString())
        }
    }

};

exports.status = function(req, res){
    var r = new twilio.TwimlResponse();
    if(req.body){
        console.log(req.body);
        // call_back_for_billing(req, req.body.CallSid);
        bill_client_phone(req.body,res)
    }
    r.hangup();
    res.send(r.toString());
};