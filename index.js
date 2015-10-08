'use strict';
var request = require('request');
var cheerio = require('cheerio');

var LPSEParser = function(url) {
  this.url = url;
}

LPSEParser.prototype.lelang = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    request(self.url + '/lelang', function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);

      var packages = [];
      $('.horizLineTop').filter(function() {
        var data = $(this);

        var title = data.find('.pkt_nama > b > a.jpopup').text();
        var agency = data.find('.agc_nama').text();
        var stage = data.find('.tahap > a.jpopup').text();
        var hps = data.find('.pkt_hps > span').text();
        var link = data.find('.pkt_nama > b > a.jpopup').attr('href');;

        var entry = {
          title: title,
          agency: agency,
          stage: stage,
          hps: hps,
          link: link
        }

        packages.push(entry);
      });
      return resolve(packages);
    });
  });
}

module.exports = LPSEParser;
