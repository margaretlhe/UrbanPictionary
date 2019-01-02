exports.game_full = function(req, res){
    res.render('errors/game-full', req.query);
}

exports.game_not_found = function(req, res){
    res.render('errors/game-not-found', req.query);
}