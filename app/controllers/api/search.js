const
    express     = require('express'),
    request     = require('request-promise'),
    router      = express.Router({mergeParams: true}),
    Promise     = require('bluebird'),
    co          = Promise.coroutine,
    cheerio     = require('cheerio');

module.exports = router;

router.get('/text', co(function*(req, res, next) {
    let {text} = req.query;

    text = decodeURIComponent(text);

    const url = `http://ec2-52-79-61-171.ap-northeast-2.compute.amazonaws.com:9200/engine/page/_search`;

    const options = {
        method: 'POST',
        url,
        body: {
            "query": {
                "query_string": {
                    "query": `*${text}*`
                }
            }
        },
        json: true
    };

    try {
        const body = yield request(options);

        const result = body.hits.hits.map(function(item) {
            let $ = cheerio.load(item._source.content);

            let desc = $('h2').eq(1).siblings('p').eq(1).text();

            return Object.assign({_id: item._id, desc}, item._source, {content: undefined});
        });

        return res.send({result: {
            result,
            total: body.hits.total
        }});
    }

    catch(e) {
        console.error(e);
        res.status(400).send({
            message: e.message
        });
    }
}));

router.get('/formulaImage', function(req, res, next) {

});