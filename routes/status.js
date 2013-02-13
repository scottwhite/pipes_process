var Phone = require('../models/phone'),
    twilio = require('twilio');
/*
{ AccountSid: 'AC584a27ef4e2a013398ad27b5bcdb16a3',
  CallStatus: 'completed',
  ToZip: '21146',
  ToCity: 'PASADENA',
  ToState: 'MD',
  Called: '+14438186498',
  To: '+14438186498',
  CallDuration: '26',
  ToCountry: 'US',
  CalledZip: '21146',
  Direction: 'inbound',
  ApiVersion: '2010-04-01',
  Caller: '+17378742833',
  CalledCity: 'PASADENA',
  CalledCountry: 'US',
  Duration: '1',
  CallSid: 'CA5ca614bf601fdc250d8f2f712f12483f',
  CalledState: 'MD',
  From: '+17378742833' }
*/
exports.index = function(req, res){
    var r = new twilio.TwimlResponse();
    if(req.body){
        console.log(req.body);
        var body = req.body;
        var user_phone = new Phone(body.To);
        user_phone.on('ready', function() {
            try{
                user_phone.update_time(parseInt(body.Duration));
            }catch(e){
                console.log(e);
            }
            
        });

    }
    r.hangup();
    res.send(r.toString());
};