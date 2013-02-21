
exports.available = function(req, res){
    var list_numbers= function(err,response){
        var data=[], numbers = response.available_phone_numbers || [];
        numbers.forEach(function(number){
            data.push(number.phone_number);
        });
        res.send(data);
    }
    var number = req.params.number;
    if(!number){
        res.send('no bacon')
    }
    console.log(number.substr(0,3));
    req.app.get('provider').availablePhoneNumbers('US').local.search({AreaCode: number.substr(0,3)},list_numbers);
};