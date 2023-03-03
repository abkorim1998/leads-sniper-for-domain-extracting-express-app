const puppeteer = require('puppeteer');
require('dotenv').config();
const XLSX = require('xlsx');
const BigNumber = require('bignumber.js');
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs')


// exprass app
const app = express()
const port = 3000;

//body parser middleware
app.use(express.json());
app.use(express.static('public'))
// cross origin resource sharing allow all

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', async (req, res) => {
    res.send('Hello World!');
});

app.post('/queryWebsite', async (req, res) => {

    const websites = req.body;
    //fileter null and empty url
    const urlList = websites.map(item => item.url).filter(item => item !== null && item !== '');
    console.log(urlList);
    const scrapedData = await mainFunction(urlList, websites);
    res.json(scrapedData);

    // const promises = websites.map(website => getSocialMediaLinks(website.url));
    // Promise.all(promises)
    //     .then(data => {
    //         const result = data.map((item, index) => {
    //             return {
    //                 name: websites[index].name,
    //                 url: websites[index].url,
    //                 ...item
    //             }
    //         })
    //         res.json(result);
    //     });
});

//queryWebsite route
app.get('/queryWebsite', async (req, res) => {
    const {
        website
    } = req.query;
    res.send(await mainFunction([website]));
});


app.listen(port, () => {
    //get the ip address of the server
    const ifaces = require('os').networkInterfaces();
    const ip = Object.keys(ifaces).reduce((prev, curr) => {
        ifaces[curr].forEach(iface => {
            if (iface.family === 'IPv4' && iface.internal === false) {
                prev = iface.address;
            }
        });
        return prev;
    }, null);
    console.log(`Server is running on http://${ip}:${port}`);
    console.log(`Server is running on http://localhost:${port}/queryWebsite?website=https://www.farzilondon.com/`);
});







// // url list 
// const urlList = `
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
//     http://www.amaya.biz/
//     http://www.farzilondon.com/
// `;

// const l  = urlList.split('\n');
// const removeEmpty = l.filter(item => item.trim() !== '');


// mainFunction(removeEmpty);
async function mainFunction(urlList, moreData) {

    // open browser 
    const browser = await puppeteer.launch({
        headless: false,
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        // executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    });


    // open all pages
    const pagelist = await Promise.all(urlList.map(async (url, index) => {
        const page = await browser.newPage();
        try {
            await page.goto(url.trim(), {
                // timeout: 500000, // it means 
            });
            return {
                "page": page,
                "url": url,
                "index": index
            };
        } catch (error) {
            await page.close();
            return {
                "page": page,
                "url": url,
                "index": index
            };

        }
    }));

    // get data of all pages
    const titleList = await Promise.all(pagelist.map(async (item) => {
        try {
            const page = item.page;
            const title = await page.title();

            const emails = await page.$$eval('a[href^="mailto:"]', links => links.map(link => link.href));
            const cleanEmails = emails.map(item => item.replace('mailto:', '').split('?')[0]); // get clean email address from href ignore mailto: and ?subject=...
            const uniqueEmails = [...new Set(cleanEmails)]; // remove duplicate emails 

            const phoneNumbers = await page.$$eval('a[href^="tel:"]', links => links.map(link => link.href));
            const cleanPhoneNumbers = phoneNumbers.map(item => item.replace('tel:', '')); // get clean phone number from href ignore tel:...
            const uniquePhoneNumbers = [...new Set(cleanPhoneNumbers)]; // remove duplicate phone numbers

            const linkedin = await page.$eval('a[href*="linkedin"]', el => el.href).catch(() => '');
            const facebook = await page.$eval('a[href*="facebook"]', el => el.href).catch(() => '');
            const twitter = await page.$eval('a[href*="twitter"]', el => el.href).catch(() => '');
            const instagram = await page.$eval('a[href*="instagram"]', el => el.href).catch(() => '');
            const youtube = await page.$eval('a[href*="youtube"]', el => el.href).catch(() => '');
            const pinterest = await page.$eval('a[href*="pinterest"]', el => el.href).catch(() => '');
            const snapchat = await page.$eval('a[href*="snapchat"]', el => el.href).catch(() => '');
            const whatsapp = await page.$eval('a[href*="whatsapp"]', el => el.href).catch(() => '');
            const tiktok = await page.$eval('a[href*="tiktok"]', el => el.href).catch(() => '');
            const telegram = await page.$eval('a[href*="telegram"]', el => el.href).catch(() => '');

            return {
                "Phone_from_website": uniquePhoneNumbers,
                "Emails": uniqueEmails,
                "linkedin": linkedin,
                "facebook": facebook,
                "twitter": twitter,
                "instagram": instagram,
                "youtube": youtube,
                "pinterest": pinterest,
                "snapchat": snapchat,
                "whatsapp": whatsapp,
                "tiktok": tiktok,
                "telegram": telegram,
                "title": title,
                "url": item.url,
                // "index": item.index 
            };
        } catch (error) {
            return {
                "Phone_from_website": [],
                "Emails": [],
                "linkedin": "",
                "facebook": "",
                "twitter": "",
                "instagram": "",
                "youtube": "",
                "pinterest": "",
                "snapchat": "",
                "whatsapp": "",
                "tiktok": "",
                "telegram": "",
                "title": "",
                "url": item.url,
                // "index": item.index 
            };
        }
    }));

    // close the browser
    await browser.close();
    // console.log(titleList);

    // marge the data with moreData by url
    if (moreData) {
        const result = titleList.map(item => {
            const data = moreData.find(data => data.url === item.url);
            return {
                ...item,
                ...data
            }
        });
        return result;
    }

    return titleList;
}