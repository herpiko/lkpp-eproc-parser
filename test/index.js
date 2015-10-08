var should = require('should');
var url = 'http://lpse.jakarta.go.id';
var LPSEParser = require('../index');
var nock = require('nock');

describe('LPSE Parser', function() {
  var scope = nock(url)
    .get('/eproc/lelang')
    .replyWithFile(200, __dirname + '/assets/lelang-1.html');

  it('should return packages', function(done) {
    var L = new LPSEParser(url + '/eproc');
    L.lelang().then(function(packages) {
      packages.length.should.equal(50);
      done();
    });
  });
});
