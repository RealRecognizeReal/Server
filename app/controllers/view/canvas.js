const
    express         = require('express'),
    router          = express.Router({mergeParams: true});

module.exports = router;

router.get('/', function(req, res, next) {
    res.render('canvas', {
        title: 'hi'
    });
});