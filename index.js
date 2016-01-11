'use strict';
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var EprocScraper = function(url) {
  this.url = url;
}

EprocScraper.prototype.lelangGetDate = function(id) {
  var self = this;
  var months = {
    'Januari': 1, 
    'Februari': 2, 
    'Maret': 3, 
    'April': 4, 
    'Mei': 5, 
    'Juni': 6, 
    'Juli': 7, 
    'Agustus': 8,
    'September': 9, 
    'Oktober': 10, 
    'November': 11, 
    'Desember': 12
  }
  return new Promise(function(resolve, reject) {
    var url = self.url + '/lelang/tahap/' + id;
    request(url, function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);

      var firstDate;
      $('tr').filter(function() {
        var data = $(this);
        var lines = data.find('td.horizLineSel');
        var d = $(lines).text().split(' ');
        if (d[0] && d[1] && d[2]) {
          firstDate = new Date(
              parseInt(d[2]),
              months[d[1]] - 1,
              parseInt(d[0])
              );
        }
      });
      return resolve(firstDate);
    });
  });
}


EprocScraper.prototype.lelang = function(page, cb) {
  var self = this;
  if (!page) page = 1;
  return new Promise(function(resolve, reject) {
    var url = self.url + '/lelang.gridtable.pager/' + page + '?s=5';
    request(url, function(err, response, html) {
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
        var id = link.replace(/\/eproc\/lelang\/view\/([0-9]+).+/, '$1');
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
      if (cb) {
        cb(page);
      }

      var getDate = function(i) {
        self.lelangGetDate(packages[i].id)
          .then(function(date) {
            packages[i].date = date;
            if ((i + 1)< packages.length) {
              getDate(i + 1);
            } else {
              return resolve(packages);
            }
          });
      }

      if (packages.length > 0) {
        getDate(0);
      } else {
        resolve([]);
      }
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
      async.eachSeries(packages, function(p, cb){
        self.namaPemenang(p.id)
          .then(function(winner){
            p.winner = winner;
            cb();
          })
          .catch(function(err){
            cb(err);
          })
      }, function(err){
        if (err) {
          return reject(err);
        }
        return resolve(packages);
      });
    });
  });
}

EprocScraper.prototype.namaPemenang = function(id){
  var self = this;
  return new Promise(function(resolve, reject) {
    request(self.url + '/rekanan/lelangpeserta/' + id, function(err, response, html) {
      if (err) return reject(err);

      var $ = cheerio.load(html);
      var finalWinner = false;
      var winner;
      var packages = [];
      $("tr").filter(function(){
        var data = $(this);
        var score = data.find("th").text();
        var name = data.find("td:nth-child(2)").text();
        var entry = {
          name : name,
          score : score
        }
        if (score && parseFloat(score) > 0) {
          packages.push(entry);
        } else if (isNaN(parseFloat(score))){
          if (!finalWinner) {
            var str = data.find("td:nth-child(7) > img").attr("src");
            if (str && str.indexOf("star.gif") > -1) {
              winner = entry;
              winner.status = "finalWinner";
              finalWinner = true;
            }
          }
        }
      })
      if (!finalWinner) {
        packages.sort(function (a, b) {
          if (a.score > b.score) {
            return 1;
          }
          if (a.score < b.score) {
            return -1;
          }
          return 0;
        });
        winner = packages[0];
        winner.status = "highScore";
      }
      console.log("Winner of " + id);
      console.log(winner);
      return resolve(winner);
    });
  });
}

module.exports = EprocScraper;
