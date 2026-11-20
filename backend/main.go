package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
)

type NguoiDung struct {
	Username string `json:"username"`
	Password string `json:"password"`
	HoTen    string `json:"hoTen"`
	Role     string `json:"role"`
}

type SanPham struct {
	Ten string  `json:"ten"`
	Dvt string  `json:"dvt"`
	Gia float64 `json:"gia"`
}

type HoaDon struct {
	Ma       string  `json:"ma"`
	Khach    string  `json:"khach"`
	Ngay     string  `json:"ngay"`
	Tong     float64 `json:"tong"`
	NguoiTao string  `json:"nguoiTao"`
}

var (
	mu                sync.Mutex
	danhSachNguoiDung = []NguoiDung{
		{Username: "admin", Password: "123", HoTen: "Quản trị viên", Role: "admin"},
		{Username: "nhanvien", Password: "123", HoTen: "Nhân viên bán hàng", Role: "user"},
	}
	danhSachHang = []SanPham{
		{Ten: "Ống nhựa PVC D27", Dvt: "Cây", Gia: 42000},
		{Ten: "Ống nhựa PVC D21", Dvt: "Cây", Gia: 30000},
		{Ten: "Dây điện Cadivi 2.5", Dvt: "Cuộn", Gia: 790000},
		{Ten: "Aptomat Panasonic 20A", Dvt: "Cái", Gia: 95000},
		{Ten: "Xi măng Hà Tiên", Dvt: "Bao", Gia: 98000},
	}
	danhSachHoaDon = []HoaDon{}
)

func taiDuLieu() {
	if _, err := os.Stat("data"); os.IsNotExist(err) {
		os.MkdirAll("data", 0755)
	}
	bytes, err := os.ReadFile("data/database.json")
	if err != nil {
		luuDuLieu()
		return
	}
	var dl struct {
		NguoiDung []NguoiDung `json:"nguoiDung"`
		SanPham   []SanPham   `json:"sanPham"`
		HoaDon    []HoaDon    `json:"hoaDon"`
	}
	if err := json.Unmarshal(bytes, &dl); err == nil {
		if len(dl.NguoiDung) > 0 {
			danhSachNguoiDung = dl.NguoiDung
		}
		if len(dl.SanPham) > 0 {
			danhSachHang = dl.SanPham
		}
		danhSachHoaDon = dl.HoaDon
	}
}

func luuDuLieu() {
	if _, err := os.Stat("data"); os.IsNotExist(err) {
		os.MkdirAll("data", 0755)
	}
	dl := struct {
		NguoiDung []NguoiDung `json:"nguoiDung"`
		SanPham   []SanPham   `json:"sanPham"`
		HoaDon    []HoaDon    `json:"hoaDon"`
	}{
		NguoiDung: danhSachNguoiDung,
		SanPham:   danhSachHang,
		HoaDon:    danhSachHoaDon,
	}
	bytes, _ := json.MarshalIndent(dl, "", "  ")
	os.WriteFile("data/database.json", bytes, 0644)
}

func xuLyCORS(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return true
	}
	return false
}

func main() {
	taiDuLieu()
	port := "8080"
	mux := http.NewServeMux()

	mux.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		if xuLyCORS(w, r) {
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		mu.Lock()
		defer mu.Unlock()
		for _, u := range danhSachNguoiDung {
			if u.Username == req.Username && u.Password == req.Password {
				json.NewEncoder(w).Encode(map[string]interface{}{
					"success":  true,
					"username": u.Username,
					"hoTen":    u.HoTen,
					"role":     u.Role,
				})
				return
			}
		}

		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Sai tên đăng nhập hoặc mật khẩu!",
		})
	})

	mux.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		if xuLyCORS(w, r) {
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
			HoTen    string `json:"hoTen"`
			Role     string `json:"role"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		username := strings.TrimSpace(req.Username)
		password := strings.TrimSpace(req.Password)
		hoTen := strings.TrimSpace(req.HoTen)
		role := req.Role

		if username == "" || password == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"message": "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!",
			})
			return
		}

		if hoTen == "" {
			hoTen = username
		}
		if role != "admin" {
			role = "user"
		}

		mu.Lock()
		defer mu.Unlock()
		for _, u := range danhSachNguoiDung {
			if strings.EqualFold(u.Username, username) {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"success": false,
					"message": "Tên đăng nhập đã tồn tại trên hệ thống!",
				})
				return
			}
		}

		newUser := NguoiDung{
			Username: username,
			Password: password,
			HoTen:    hoTen,
			Role:     role,
		}
		danhSachNguoiDung = append(danhSachNguoiDung, newUser)
		luuDuLieu()

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Đăng ký tài khoản thành công!",
		})
	})

	mux.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
		if xuLyCORS(w, r) {
			return
		}
		w.Header().Set("Content-Type", "application/json")
		mu.Lock()
		defer mu.Unlock()

		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(danhSachHang)
		} else if r.Method == http.MethodPost {
			var sp SanPham
			if err := json.NewDecoder(r.Body).Decode(&sp); err == nil {
				danhSachHang = append(danhSachHang, sp)
				luuDuLieu()
				json.NewEncoder(w).Encode(sp)
			}
		} else if r.Method == http.MethodDelete {
			ten := r.URL.Query().Get("ten")
			var moi []SanPham
			for _, item := range danhSachHang {
				if !strings.EqualFold(item.Ten, ten) {
					moi = append(moi, item)
				}
			}
			danhSachHang = moi
			luuDuLieu()
			json.NewEncoder(w).Encode(map[string]bool{"success": true})
		}
	})

	mux.HandleFunc("/api/invoices", func(w http.ResponseWriter, r *http.Request) {
		if xuLyCORS(w, r) {
			return
		}
		w.Header().Set("Content-Type", "application/json")
		mu.Lock()
		defer mu.Unlock()

		if r.Method == http.MethodGet {
			role := r.URL.Query().Get("role")
			user := r.URL.Query().Get("user")

			if role == "admin" || user == "" {
				json.NewEncoder(w).Encode(danhSachHoaDon)
			} else {
				var loc []HoaDon
				for _, hd := range danhSachHoaDon {
					if hd.NguoiTao == user {
						loc = append(loc, hd)
					}
				}
				json.NewEncoder(w).Encode(loc)
			}
		} else if r.Method == http.MethodPost {
			var hd HoaDon
			if err := json.NewDecoder(r.Body).Decode(&hd); err == nil {
				danhSachHoaDon = append([]HoaDon{hd}, danhSachHoaDon...)
				luuDuLieu()
				json.NewEncoder(w).Encode(hd)
			}
		} else if r.Method == http.MethodDelete {
			ma := r.URL.Query().Get("ma")
			var moi []HoaDon
			for _, item := range danhSachHoaDon {
				if item.Ma != ma {
					moi = append(moi, item)
				}
			}
			danhSachHoaDon = moi
			luuDuLieu()
			json.NewEncoder(w).Encode(map[string]bool{"success": true})
		}
	})

	fmt.Println("Backend dang chay tai: http://localhost:" + port)
	http.ListenAndServe(":"+port, mux)
}
