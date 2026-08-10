const badHeaders = {
    "host": "vsmov.com",
    "connection": "keep-alive",
    "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
    "accept": "application/json",
    "sec-ch-ua-mobile": "?0",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9,vi;q=0.8"
};

const res = await fetch("https://vsmov.com/api/the-loai/hoat-hinh?page=1&limit=24", {
    headers: badHeaders
});
console.log(res.status);
