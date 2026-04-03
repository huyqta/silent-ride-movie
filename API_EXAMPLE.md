# Lấy danh sách phim mới
# Lấy danh sách phim mới, trang 1

Yêu cầu:

GET /v1/api/danh-sach/phim-moi?page=1&limit=24
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim hành động"
  }
}
# Lấy danh sách phim bộ
# Lấy danh sách phim bộ, trang 1

Yêu cầu:

GET /v1/api/danh-sach/phim-bo?page=1&limit=24
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim Bộ"
  }
}

# Lấy danh sách phim hành động âu mỹ
# Lấy danh sách phim hành động âu mỹ, trang 1

Yêu cầu:

GET /v1/api/the-loai/hanh-dong?page=1&limit=24&country=au-my
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim hành động"
  }
}

# Lấy danh sách phim tình cảm hàn quốc
# Lấy danh sách phim tình cảm hàn quốc, trang 1

Yêu cầu:

GET /v1/api/the-loai/tinh-cam?page=1&limit=24&country=han-quoc
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim tình cảm"
  }
}

# Lấy danh sách phim hàn quốc 2025
# Lấy danh sách phim hàn quốc 2025, trang 1

Yêu cầu:

GET /v1/api/quoc-gia/han-quoc?page=1&limit=24&year=2025
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim hàn quốc"
  }
}

# Lấy danh sách phim hàn quốc cổ trang
# Lấy danh sách phim hàn quốc cổ trang, trang 1

Yêu cầu:

GET /v1/api/quoc-gia/han-quoc?page=1&limit=24&category=co-trang
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim tình cảm"
  }
}

# Lấy danh sách phim năm 2025
# Lấy danh sách phim năm 2025, trang 1

Yêu cầu:

GET /v1/api/nam-phat-hanh/2025?page=1&limit=24
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim năm 2025"
  }
}

# Lấy danh sách phim hành động Hàn Quốc năm 2025
# Lấy danh sách phim hành động Hàn Quốc năm 2025, trang 1

Yêu cầu:

GET /v1/api/nam-phat-hanh/2025?page=1&limit=24&category=hanh-dong&country=han-quoc
Phản hồi:

{
  "status": "success",
  "data": {
    "items": [...],
    "titlePage": "Phim năm 2025"
  }
}