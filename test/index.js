var should = require('should');
var url = 'http://lpse.jakarta.go.id';
var EprocScraper = require('../index');
var nock = require('nock');

describe('e-Proc Scraper', function() {
  nock(url)
    .get('/eproc/lelang')
    .replyWithFile(200, __dirname + '/assets/lelang-1.html');

  nock(url)
    .get('/eproc/publiclelangumum')
    .replyWithFile(200, __dirname + '/assets/lelang-2.html');

  nock(url)
    .get('/eproc/lelang/pemenangcari')
    .replyWithFile(200, __dirname + '/assets/lelang-3.html');

  it('should return packages', function(done) {
    var L = new EprocScraper(url + '/eproc');
    L.lelang().then(function(packages) {
      packages.length.should.equal(50);
      for (var i = 0; i < packages.length; i++) {
        var p = packages[i];
        p.link.indexOf(p.id).should.equal(p.link.length - p.id.length);
      }
      done();
    });
  });

  it('should return packages for "lelang umum non-eproc"', function(done) {
    var L = new EprocScraper(url + '/eproc');
    L.lelangUmum().then(function(packages) {
      packages.length.should.equal(50);
      for (var i = 0; i < packages.length; i++) {
        var p = packages[i];
        p.link.indexOf(p.id).should.equal(p.link.length - p.id.length);
      }
      done();
    });
  });

  it('should return the winning bidders', function(done) {
    var L = new EprocScraper(url + '/eproc');
    L.pemenang().then(function(winners) {
      winners.length.should.equal(30);
      for (var i = 0; i < winners.length; i++) {
        var p = winners[i];
        p.link.indexOf(p.id).should.equal(p.link.length - p.id.length);
      }
      done();
    });
  });


});
