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

var client_outbound = function(user_phone,digits, res){
    var caller =user_phone.user_number,
            r = new twilio.TwimlResponse();
    r.dial({timeLimit: user_phone.time_left, callId: caller},
            function(node){node.number(user_phone.convert(digits));});
        console.log(r.toString());
        res.send(r.toString()); 
};

var client_phone = function(user_phone,body, res) {
        var caller = body.From,
            r = new twilio.TwimlResponse();

        r.dial({timeLimit: user_phone.time_left, callId: caller},
            function(node){node.number(user_phone.convert(user_phone.user_number));});
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
                if (user_phone.convert(user_phone.user_number) == body.From) {
                    r = new Twiml.TwimlResponse();
                    // gen token
                    user_phone.unqiue_token().on('update',function(err,token){
                        r.gather({
                        //TODO: get url from env fool
                            action: 'http://process.test.pipes.io/digits/' + body.To + '?token=' + token,
                            method:'GET'
                        },
                        function(){
                            this.say('Enter in number to call, press pound when completed');
                        }).say('You did not enter a number, goodbye');
                    });
                    
                }else{
                    client_phone(user_phone,body,res);    
                }
                
            }catch(e){
                console.log(e);
                r = new twilio.TwimlResponse();
                r.say('Not working, hanging up').hangup();
                res.send(r.toString());
            }            
        });

    }

};

exports.digits = function(req,res){
    var digits = req.params.Digits,
        number = req.params.number,
        toke = req.params.toke;
    var r = new Twiml.TwimlResponse();
    if(!toke || !digits || !number){
        console.log("missing param");
        console.log(req.params);
        r.hangup();
        res.send(r.toString());
        return;
    }
    user_phone = new Phone(number);
    user_phone.on('ready', function() {
        user_phone.has_token(toke,function(err,does){
            if(does){
                client_outbound(user_number, digits,res);
                user_phone.remove_token(function(err,results){});
            }else{
                res.send(r.hangup().toString());
            }
        });
        
    });
};


