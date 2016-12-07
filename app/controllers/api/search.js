const
    express     = require('express'),
    request     = require('request-promise'),
    router      = express.Router({mergeParams: true}),
    Promise     = require('bluebird'),
    co          = Promise.coroutine,
    path        = require('path'),
    appRoot     = require('app-root-path'),
    multer      = require('multer'),
    fs          = require('fs'),
    cheerio     = require('cheerio');


const upload = multer({dest: path.join(appRoot.path, 'temp')})

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

            let desc = $('h2').eq(1).siblings('p').eq(0).text();

            if( desc === undefined ) {
                desc = $('h2').eq(2).siblings('p').eq(0).text();
            }

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

router.post('/formulaHand',
    function(req, res, next) {
        const {body: {strokes}} = req;

        const arr = JSON.parse(strokes);

        const fileName = (function() {
            let fileName = '';

            for(let i = 0 ; i < 10 ; i++) {
                fileName += String.fromCharCode(Math.floor(Math.random()*10)+'0'.charCodeAt(0));
            }

            return fileName;
        })();


        const content = (function(arr) {
            let content = 'SCG_INK\n';

            content += arr.length+'\n';

            for(let i = 0 ; i < arr.length ; i++) {
                content += arr[i].length+'\n';

                for(let j = 0 ; j < arr[i].length ; j++) {
                    content += (arr[i][j][0] + ' ' + arr[i][j][1])+'\n';
                }
            }

            return content;
        })(arr);

        return fs.writeFile('/root/data/'+fileName, content, function(err) {
            var exec = require('child_process').exec;
            var cmd = `docker exec -i hand python /root/factory/seshat/solution.py ${fileName}`;

            exec(cmd, function(error, stdout, stderr) {
                if(error) {
                    console.error(error);
                    return;
                }

                const idx = stdout.indexOf('LaTeX:');

                stdout = stdout.substr(idx+7);
                stdout = stdout.substr(0, stdout.length-1);

                console.log(stdout);
                res.send({latex: stdout});
            });


        });
    }
);

router.post('/formulaImage',
    upload.single('formulaImage'),
    function(req, res, next) {

        //req.file로 접근 가능
        return res.send({result: {
            result: [],
            total: 0
        }});
    }
);