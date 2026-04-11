# Plyr Player Reference

Tài liệu rút gọn tập chuẩn cho việc phát triển và cấu hình Plyr trong dự án.

## 1. Options (Cấu hình)

Dưới đây là các tùy chọn phổ biến khi khởi tạo `new Plyr()`.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `controls` | Array | `['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']` | Các nút điều khiển hiển thị. |
| `settings` | Array | `['captions', 'quality', 'speed', 'loop']` | Các mục trong menu cài đặt. |
| `autoplay` | Boolean | `false` | Tự động phát khi load. |
| `autopause` | Boolean | `true` | Chỉ cho phép 1 player phát tại một thời điểm. |
| `seekTime` | Number | `10` | Thời gian tiến/lùi (giây). |
| `volume` | Number | `1` | Âm lượng ban đầu (0 to 1). |
| `muted` | Boolean | `false` | Bắt đầu ở chế độ tắt tiếng. |
| `clickToPlay` | Boolean | `true` | Chạm vào video để Play/Pause. |
| `hideControls` | Boolean | `true` | Tự động ẩn controls sau 2 giây không tương tác. |
| `displayDuration` | Boolean | `true` | Hiển thị tổng thời lượng video. |
| `invertTime` | Boolean | `true` | Hiển thị thời gian đếm ngược. |
| `fullscreen.enabled`| Boolean | `true` | Cho phép chế độ toàn màn hình. |
| `fullscreen.iosNative`| Boolean | `false` | Sử dụng trình phát gốc của iOS khi fullscreen. |
| `storage.enabled` | Boolean | `true` | Lưu cài đặt người dùng (volume, quality...) vào LocalStorage. |
| `speed.options` | Array | `[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4]` | Các lựa chọn tốc độ phát. |
| `quality.default` | Number | `576` | Chất lượng mặc định. |

---

## 2. API Methods (Hàm điều khiển)

Sử dụng thông qua instance: `const player = new Plyr(...)`.

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `play()` | - | Phát video. |
| `pause()` | - | Tạm dừng. |
| `togglePlay(toggle)` | Boolean (opt) | Chuyển đổi Play/Pause. |
| `stop()` | - | Dừng và quay về đầu video. |
| `rewind(seekTime)` | Number (opt) | Tua lùi. |
| `forward(seekTime)` | Number (opt) | Tua tiến. |
| `fullscreen.enter()` | - | Vào chế độ toàn màn hình. |
| `fullscreen.exit()` | - | Thoát toàn màn hình. |
| `fullscreen.toggle()` | - | Chuyển đổi toàn màn hình. |
| `destroy()` | - | Hủy instance và dọn dẹp bộ nhớ. |

---

## 3. Getters & Setters (Lấy và Gán giá trị)

| Property | Getter | Setter | Description |
| :--- | :--- | :--- | :--- |
| `playing` | ✓ | - | Đang phát hay không. |
| `paused` | ✓ | - | Đang tạm dừng hay không. |
| `currentTime` | ✓ | ✓ | Thời gian hiện tại (giây). |
| `duration` | ✓ | - | Tổng thời lượng video. |
| `volume` | ✓ | ✓ | Âm lượng (0 - 1). |
| `muted` | ✓ | ✓ | Trạng thái tắt tiếng. |
| `speed` | ✓ | ✓ | Tốc độ phát hiện tại. |
| `quality` | ✓ | ✓ | Chất lượng hiện tại. |
| `source` | ✓ | ✓ | Gán nguồn phát mới (Object). |

### Ví dụ `.source` setter:
```js
player.source = {
  type: 'video',
  sources: [{ src: '/path/to/video.mp4', type: 'video/mp4', size: 720 }],
  poster: '/path/to/poster.jpg'
};
```

---

## 4. Events (Sự kiện)

```js
player.on('playing', event => { ... });
```

| Event | Description |
| :--- | :--- |
| `ready` | Player đã sẵn sàng. |
| `play` | Bắt đầu phát. |
| `pause` | Tạm dừng. |
| `playing` | Đang phát (sau khi buffer xong hoặc resume). |
| `progress` | Quá trình load video. |
| `timeupdate` | Thời gian phát thay đổi. |
| `volumechange` | Âm lượng thay đổi. |
| `seeking` | Đang thực hiện tua. |
| `seeked` | Đã tua xong. |
| `ratechange` | Tốc độ phát thay đổi. |
| `ended` | Kết thúc video. |
| `enterfullscreen` | Vào toàn màn hình. |
| `exitfullscreen` | Thoát toàn màn hình. |

---

## 5. CSS Custom Properties (Giao diện)

Thay đổi màu sắc và style bằng biến CSS:

| Name | Default | Description |
| :--- | :--- | :--- |
| `--plyr-color-main` | `#00b3ff` | Màu chủ đạo (nút play, thanh tiến trình). |
| `--plyr-video-background` | `rgba(0,0,0,1)` | Màu nền video. |
| `--plyr-control-radius` | `3px` | Bo góc các nút điều khiển. |
| `--plyr-range-fill-background` | `var(--plyr-color-main)` | Màu thanh tiến trình đã chạy qua. |
| `--plyr-font-family` | - | Font chữ sử dụng. |
| `--plyr-font-size-base` | `15px` | Kích thước chữ cơ bản. |

---

## 6. Shortcuts (Phím tắt)

| Key | Action |
| :--- | :--- |
| `0` to `9` | Nhảy đến 0% - 90% thời lượng. |
| `space` / `K` | Play / Pause. |
| `←` / `→` | Tua lùi / tiến. |
| `↑` / `↓` | Tăng / Giảm âm lượng. |
| `M` | Tắt/Bật tiếng. |
| `F` | Bật/Tắt toàn màn hình. |
| `C` | Bật/Tắt phụ đề. |
| `L` | Bật/Tắt lặp lại (Loop). |
