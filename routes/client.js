var bill_client_phone = function(body, res) {
    var id = body.Caller.split(':')[1];
    var user_phone = new Phone(id); //did phone id
    user_phone.on('ready',function(){
        user_phone.enter_call(body);
        user_phone.update_time(body.Duration * 60);
        res.send();
    });
};

var client_phone = function(body, res) {
        var id = body.Caller.split(':')[1];
        var user_phone = new Phone(id); //did phone id
        var r = new twilio.TwimlResponse();
        user_phone.on('ready', function() {
            r.dial({timeLimit: user_phone.time_left, callId: body.From},
            function(node){node.number(user_phone.convert(user_phone.user_number))});
                console.log(r.toString());
                res.send(r.toString()); 
            });
};


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
        var body = req.body;
        var user_phone = new Phone(body.To);
        user_phone.on('ready', function() {
            try{
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