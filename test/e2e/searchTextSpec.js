const
    path            = require('path'),
    appRoot         = require('app-root-path'),
    coMocha         = require('co-mocha'),
    mocha           = require('mocha'),
    chai            = require('chai'),
    expect          = chai.expect,
    Promise         = require('bluebird'),
    supertest       = require('supertest-as-promised');

coMocha(mocha);

describe('# Search Text Controller', () => {
    let agent;

    beforeEach(function() {
        agent = supertest.agent(require(path.join(appRoot.path, 'app')));
    });

    it('should have not-null agent.', function*() {
        expect(agent).not.to.be.undefined;
    });

    it('should return result when request to /api/search/text.', function*() {
        const resp = yield agent.get('/api/search/text')
            .expect(200);

        const {body} = resp;

        expect(body).to.have.property('result');
        expect(body.result).to.have.length(2);
    });
});