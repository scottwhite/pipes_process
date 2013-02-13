var Phone = require('../models/phone');
exports.index = function(req, res){
    if(req.body){
        var body = req.body;
        var user_phone = new Phone(body.To);

        user_phone.on('ready', function() {
            console.log("phone is reading, dialing " + user_phone.user_number);
            user_phone.update_time(parseFloat(body.DialCallDuration))
        });

    }
    res.send('bacon')
};