const scrapeIt = require("scrape-it")
const _ = require("lodash")
const fs = require('fs');
const Promise = require('bluebird');

function save(data) {
    return new Promise((resolve, reject)=> {
        fs.writeFile(
            "./data.json",
            JSON.stringify(data),
            function(err) {
                if(err) {
                    reject(err);
                }
                resolve();
            });
    });
}

function scrapeSearch(url) {
    return scrapeIt(url, {
        data: {
            listItem: '.quickViewAction.sPrimaryLink',
            data: { url: { attr: 'href' } }
        }
    }).then(({data, response})=> {
        //console.log(`Status Code: ${response.statusCode}`)
        //console.log(data)
        return data.data;
    }).catch((err)=> {
        console.error(err);
        return err;
    });
}

function scrapeDetails(url){
    console.log("Scrapping details for ", url);
    return scrapeIt(url, {
        title: '.product-title h1',
        price: 'h3.price',
        connectionTitle: '.connection-title',
        connectionValue: '.item-connection .value',
        attributes: {
            listItem: '.item-details-mini ul.generatedBullets li'
        }
    }).then(({data, response})=> {
        //console.log(`Status Code: ${response.statusCode}`)
        //console.log(data)
        return data;
    }).catch((err)=> {
        console.error(err);
        return err;
    });
}

Promise.all([1,2].map((i)=> {
    let searchUrl = `https://egypt.souq.com/eg-en/monitor/s/?page=${i}`;
    console.log(searchUrl);
    return Promise.delay(1000, scrapeSearch(searchUrl));
})).then((urls)=> {
    urls = _.flatten(urls);
    return Promise.mapSeries(urls, (url)=> {
        return Promise.delay(1000, scrapeDetails(url));
    });
}).then((res)=> {
    console.log(res);
    return save(res);
}).catch((err)=> {
    console.error(err);
    return err;
});
