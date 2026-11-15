package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
)

type SanPham struct {
	Ten string  `json:"ten"`
	Dvt string  `json:"dvt"`
	Gia float64 `json:"gia"`
}

type HoaDon struct {
	Ma    string  `json:"ma"`
	Khach string  `json:"khach"`
	Ngay  string  `json:"ngay"`
	Tong  float64 `json:"tong"`
}

var (
	mu             sync.Mutex
	danhSachHang   = []SanPham{
		{Ten: "Ống nhựa PVC D27", Dvt: "Cây", Gia: 42000},
		{Ten: "Ống nhựa PVC D21", Dvt: "Cây", Gia: 30000},
		{Ten: "Dây điện Cadivi 2.5", Dvt: "Cuộn", Gia: 790000},
		{Ten: "Aptomat Panasonic 20A", Dvt: "Cái", Gia: 95000},
		{Ten: "Xi măng Hà Tiên", Dvt: "Bao", Gia: 98000},
	}
	danhSachHoaDon = []HoaDon{}
)

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
	port := "8080"
	mux := http.NewServeMux()

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
			json.NewEncoder(w).Encode(danhSachHoaDon)
		} else if r.Method == http.MethodPost {
			var hd HoaDon
			if err := json.NewDecoder(r.Body).Decode(&hd); err == nil {
				danhSachHoaDon = append([]HoaDon{hd}, danhSachHoaDon...)
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
			json.NewEncoder(w).Encode(map[string]bool{"success": true})
		}
	})

	fmt.Println("Backend dang chay tai: http://localhost:" + port)
	http.ListenAndServe(":"+port, mux)
}
