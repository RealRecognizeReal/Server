const
    express     = require('express'),
    request     = require('request'),
    router      = express.Router({mergeParams: true});

module.exports = router;

router.get('/text', function(req, res) {
    let {text} = req.query;

    const url = `http://localhost:9200/engine/formula/_search?q=${text}`;

    request(url, function(error, response, body) {
        const result = body.hits.hits.map(function(item) {
            return {
                _id: item._id,
                ...item._source
            };
        });

        res.send({result});
    });
    //
    // res.send({
    //     result: []
    // });

    //
    // const result = [
    //     {
    //         _id: 1,
    //         url: 'http://test.com/test',
    //         title: 'test 1',
    //         description: 'description 1'
    //     },
    //     {
    //         _id: 2,
    //         url: 'http://test.com/test2',
    //         title: 'test 2',
    //         description: 'description 2'
    //     }
    // ];
    //
    // res.send({
    //     result
    // });
});

router.get('/formulaImage', function(req, res, next) {

});