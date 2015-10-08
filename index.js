'use strict';
var url = 'http://lpse.jakarta.go.id/eproc/';
var request = require('request');
var cheerio = require('cheerio');

request(url + 'lelang', function(err, response, html) {
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
  console.log(packages);


});
