var Phone = require('../models/phone'),
    twilio = require('twilio');

/*
{ AccountSid: 'AC584a27ef4e2a013398ad27b5bcdb16a3',
  ToZip: '21146',
  FromState: 'CA',
  Called: '+14438186498',
  FromCountry: 'US',
  CallerCountry: 'US',
  CalledZip: '21146',
  Direction: 'inbound',
  FromCity: 'BAKERSFIELD',
  CalledCountry: 'US',
  CallerState: 'CA',
  CallSid: 'CAfcf406b4b1a73b0e4482e5a7768614f0',
  CalledState: 'MD',
  From: '+16617480240',
  CallerZip: '93307',
  FromZip: '93307',
  CallStatus: 'ringing',
  ToCity: 'PASADENA',
  ToState: 'MD',
  To: '+14438186498',
  ToCountry: 'US',
  CallerCity: 'BAKERSFIELD',
  ApiVersion: '2010-04-01',
  Caller: '+16617480240',
  CalledCity: 'PASADENA' }
*/
var client_phone = function(user_phone,body, res) {
        var target_number = body.To,
            caller = body.From,
            r = new twilio.TwimlResponse();

        r.dial({timeLimit: user_phone.time_left, callId: caller},
            function(node){node.number(user_phone.convert(target_number))});
        console.log(r.toString());
        res.send(r.toString()); 
    };


exports.answer = function(req,res){
    console.log(req.body);
    res.set('Content-Type', 'text/xml');
    if(req.body){
        var body = req.body,
            r,
            user_phone = new Phone(body.To);
        user_phone.on('ready', function() {
            console.log("phone is ready, dialing " + user_phone.user_number);
            try{
                client_phone(user_phone,body,res);
            }catch(e){
                console.log(e);
                r = new twilio.TwimlResponse();
                r.say('Not working, hanging up').hangup();
                res.send(r.toString())
            }
            
        });

    }

};

