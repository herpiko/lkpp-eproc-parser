'use strict';
var request = require('request');
var cheerio = require('cheerio');

var EprocScraper = function(url) {
  this.url = url;
}

EprocScraper.prototype.lelang = function(page) {
  var self = this;
  if (!page) page = 1;
  return new Promise(function(resolve, reject) {
    request(self.url + '/lelang.gridtable.pager/' + page + '?s=5', function(err, response, html) {
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
        var id = link.substr(link.lastIndexOf('/') + 1);
        var entry = {
          title: title,
          agency: agency,
          stage: stage,
          hps: hps,
          link: link,
          id: id
        }

        packages.push(entry);
      });
      return resolve(packages);
    });
  });
}

EprocScraper.prototype.lelangPages = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    request(self.url + '/lelang', function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);

      var lastPage;
      $('div.t-data-grid-pager').filter(function() {
        var data = $(this);

        var pages = data.find('a');
        lastPage = $(pages[pages.length - 1]).text();
      });
      return resolve(parseInt(lastPage));
    });
  });
}

EprocScraper.prototype.lelangUmum = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    request(self.url + '/publiclelangumum', function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);

      var packages = [];
      $('.horizLine').filter(function() {
        var data = $(this);

        var title = data.find('.plp_nama_paket > a.jpopup').text();
        var agency = data.find('.stk_nama').text();
        var doc = data.find('.ambil_dok').text();
        var hps = data.find('.plp_hps > div').text();
        var link = data.find('.plp_nama_paket > a.jpopup').attr('href');;
        var id = link.substr(link.lastIndexOf('/') + 1);

        var entry = {
          title: title,
          agency: agency,
          doc: doc,
          hps: hps,
          link: link,
          id: id
        }

        packages.push(entry);
      });
      return resolve(packages);
    });
  });
}

EprocScraper.prototype.pemenang = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    request(self.url + '/lelang/pemenangcari', function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);

      var packages = [];
      $('.horizLineTop').filter(function() {
        var data = $(this);

        var title = data.find('.pkt_nama > b > a.jpopup').text();
        var agency = data.find('.agc_nama').text();
        var hps = data.find('.pkt_hps > span').text();
        var link = data.find('.pkt_nama > b > a.jpopup').attr('href');;
        var id = link.substr(link.lastIndexOf('/') + 1);

 
        var entry = {
          title: title,
          agency: agency,
          hps: hps,
          link: link,
          id: id
        }

        packages.push(entry);
      });
      return resolve(packages);
    });
  });
}

module.exports = EprocScraper;
