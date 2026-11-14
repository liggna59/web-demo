package main

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

type SanPham struct {
	Ten string  `json:"ten"`
	Dvt string  `json:"dvt"`
	Gia float64 `json:"gia"`
}

var danhSach = []SanPham{
	{Ten: "Ống nhựa PVC D27", Dvt: "Cây", Gia: 42000},
	{Ten: "Dây điện Cadivi 2.5", Dvt: "Cuộn", Gia: 790000},
	{Ten: "Aptomat Panasonic 20A", Dvt: "Cái", Gia: 95000},
}

func main() {
	mime.AddExtensionType(".css", "text/css; charset=utf-8")
	mime.AddExtensionType(".js", "application/javascript; charset=utf-8")

	port := "8080"
	mux := http.NewServeMux()

	mux.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(danhSach)
		} else if r.Method == http.MethodPost {
			var sp SanPham
			json.NewDecoder(r.Body).Decode(&sp)
			danhSach = append(danhSach, sp)
			json.NewEncoder(w).Encode(sp)
		}
	})

	dir, err := os.Getwd()
	if err != nil {
		dir = "."
	}
	if _, err := os.Stat(filepath.Join(dir, "index.html")); os.IsNotExist(err) {
		ex, err := os.Executable()
		if err == nil {
			dir = filepath.Dir(ex)
		}
	}

	mux.Handle("/", http.FileServer(http.Dir(dir)))

	fmt.Println("Server: http://localhost:" + port)
	http.ListenAndServe(":"+port, mux)
}
