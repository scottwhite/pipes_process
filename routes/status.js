var Phone = require('../models/phone'),
    twilio = require('twilio');
exports.index = function(req, res){
    var r = new twilio.TwimlResponse();
    if(req.body){
        console.log(req.body);
        var body = req.body;
        var user_phone = new Phone(body.To);

        user_phone.on('ready', function() {
            console.log("phone is reading, dialing " + user_phone.user_number);
            user_phone.update_time(parseFloat(body.DialCallDuration));
        });

    }
    r.hangup();
    res.send(r.toString());
};