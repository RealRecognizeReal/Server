const
    express     = require('express'),
    router      = express.Router({mergeParams: true});

module.exports = router;

router.get('/text', function(req, res) {
    const {text} = req.query;

    const result = [
        {
            _id: 1,
            url: 'http://test.com/test',
            title: 'test 1',
            description: 'description 1'
        },
        {
            _id: 2,
            url: 'http://test.com/test2',
            title: 'test 2',
            description: 'description 2'
        }
    ];

    res.send({
        result
    });
});

router.get('/formulaImage', function(req, res, next) {

});