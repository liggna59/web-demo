package main

import (
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	mime.AddExtensionType(".css", "text/css; charset=utf-8")
	mime.AddExtensionType(".js", "application/javascript; charset=utf-8")

	port := "3000"
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

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(dir)))

	fmt.Println("Frontend dang chay tai: http://localhost:" + port)
	http.ListenAndServe(":"+port, mux)
}
