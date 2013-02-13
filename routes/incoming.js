var client_phone = function(body, res) {
        var target_number = body.To,
            caller = body.From;
        var user_phone = new Phone(target_number); //did phone id
        var r = new twilio.TwimlResponse();
        user_phone.on('ready', function() {
            console.log("phone is reading, dialing " + target_number);
            r.dail({timeLimit: user_phone.time_left, callId: caller, action: 'http://process.test.pipes.io/status', method: 'POST'}).number(user_phone.convert(target_number))
           res.send(r.toString()); 
        });
    };


exports.incoming = function(req,res){
    console.log(req.body);
    res.set('Content-Type', 'text/xml');
    if(req.body){
        var body = req.body,
            r,
            user_phone = new Phone(body.To);
        user_phone.on('ready', function() {
            console.log("phone is ready, dialing " + user_phone.user_number);
            try{
                client_phone(body,res);
            }catch(e){
                console.log(e);
                r = new twilio.TwimlResponse();
                r.say('Not working, hanging up')
                r.hangup();
                res.send(r.toString())
            }
            
        });

    }

};

