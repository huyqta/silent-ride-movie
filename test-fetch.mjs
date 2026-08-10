const res = await fetch("http://localhost:3000/api/vsmov/danh-sach/phim-bo?page=1&limit=24", {
  headers: {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "connection": "keep-alive",
    "host": "localhost:3000",
    "referer": "http://localhost:3000/",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  }
});
console.log(res.status);
