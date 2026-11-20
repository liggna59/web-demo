# Web Quản Lý Bán Hàng Vật Tư Bán Lẻ

Hệ thống quản lý bán hàng và hóa đơn kiến trúc tách biệt Frontend và Backend, hỗ trợ xác thực phân quyền và triển khai Docker.

## Cấu trúc hệ thống
- `backend/`: Golang REST API (Port 8080)
- `frontend/`: Nginx Web Server, HTML, CSS, JavaScript, TypeScript (Port 3000)

## Danh sách tài khoản mặc định
| Tên đăng nhập | Mật khẩu | Họ tên | Vai trò | Quyền hạn |
|---|---|---|---|---|
| `admin` | `123` | Quản trị viên | **admin** | Toàn quyền quản lý kho, xem toàn bộ hóa đơn, xóa hóa đơn |
| `nhanvien` | `123` | Nhân viên bán hàng | **user** | Lập hóa đơn, xem kho (không được xóa hàng), xem đơn của chính mình |

## Hướng dẫn chạy bằng Docker
```bash
docker compose up --build
```
Truy cập giao diện: http://localhost:3000

## Hướng dẫn Public Internet bằng Cloudflare Tunnel
```bash
cloudflared tunnel --url http://localhost:3000
```
Truy cập qua đường link công khai: https://xxx.trycloudflare.com
