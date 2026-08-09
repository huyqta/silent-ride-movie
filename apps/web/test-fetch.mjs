async function test() {
  try {
    const url = "https://ophim1.com/v1/api/danh-sach/phim-le?page=1&limit=24";
    console.log("Fetching", url);
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data items count:", data.data?.items?.length);
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

test();
