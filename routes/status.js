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

var call_back_for_billing = function(req,call_sid){
  req.app.get('provider').calls(call_sid).get(function(err,data){
    console.log(data);
  });
}
exports.index = function(req, res){
    var r = new twilio.TwimlResponse();
    if(req.body){
        console.log(req.body);
        var body = req.body;
        var user_phone = new Phone({type:'phone', n: body.To});
        user_phone.on('ready', function() {
            try{
              // call_back_for_billing(req,req.body.CallSid);
                user_phone.update_time(parseInt(body.Duration)*60).on('failed',function(err){
                    console.log(err);
                })
            }catch(e){
                console.log(e);
            }
            
        });

    }
    r.hangup();
    res.send(r.toString());
};

// { AccountSid: 'AC584a27ef4e2a013398ad27b5bcdb16a3',
//   ApplicationSid: 'APaebf287000ce4318bee561df1b85f693',
//   CallStatus: 'in-progress',
//   DialCallSid: 'CAe57cfd8046860b81faa629d36fd81cfa',
//   To: '',
//   Called: '',
//   DialCallStatus: 'completed',
//   Direction: 'inbound',
//   ApiVersion: '2010-04-01',
//   Caller: 'client:4',
//   CallSid: 'CA1fb115ad471cd6e32ac78232d1a5a533',
//   DialCallDuration: '15',
//   From: 'client:4' }
exports.routed_status = function(req,res){
  console.log(req.body);
  res.send('ok');
}