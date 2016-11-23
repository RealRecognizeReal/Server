const
    express     = require('express'),
    router      = express.Router({mergeParams: true});

module.exports = router;

router.head('/', function(req, res) {
    res.send({});
});