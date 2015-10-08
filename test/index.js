var should = require('should');
var url = 'http://lpse.jakarta.go.id';
var EprocScraper = require('../index');
var nock = require('nock');

describe('e-Proc Scraper', function() {
  var scope = nock(url)
    .get('/eproc/lelang')
    .replyWithFile(200, __dirname + '/assets/lelang-1.html');

  it('should return packages', function(done) {
    var L = new EprocScraper(url + '/eproc');
    L.lelang().then(function(packages) {
      packages.length.should.equal(50);
      done();
    });
  });
});
