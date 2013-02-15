var Phone = require('../models/phone'),
    twilio = require('twilio');

var bill_client_phone = function(body, res) {
    var id = body.Caller.split(':')[1];
    var user_phone = new Phone({type:'id', n: id}); //did phone id
    user_phone.on('ready',function(){
        user_phone.enter_call(body);
        user_phone.update_time(body.Duration * 60);
    });
};

var client_phone = function(body, res) {
    var id = body.Caller.split(':')[1];
    var user_phone = new Phone({type: 'id', n: id}); //did phone id
    var r = new twilio.TwimlResponse();
    user_phone.on('ready', function() {
        r.dial({timeLimit: user_phone.time_left, callerId: user_phone.pipes_number},
        function(node){node.number(user_phone.convert(user_phone.user_number))});
            console.log(r.toString());
            res.send(r.toString()); 
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
        bill_client_phone(req.body,res)
    }
    r.hangup();
    res.send(r.toString());
};