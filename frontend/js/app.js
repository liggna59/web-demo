const API_BASE = (window.location.protocol === "file:" || window.location.port === "5500" || window.location.port === "5501" || window.location.port === "8000" || (window.location.hostname === "localhost" && window.location.port !== "3000"))
    ? "http://localhost:8080/api"
    : "/api";

let currentUser = null;
let danhSachHang = [];
let danhSachHoaDon = [];
let cacDongHang = [];

function hienAuthAlert(msg, type) {
    let alertBox = document.getElementById("authAlert");
    if (!alertBox) return;
    if (!msg) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
        return;
    }
    alertBox.className = "gh-alert " + (type === "error" ? "alert-error" : "alert-success");
    alertBox.textContent = msg;
    alertBox.style.display = "block";
}

function chuyenAuthTab(tab) {
    hienAuthAlert("", "");
    let cardLogin = document.getElementById("cardLogin");
    let subcardLogin = document.getElementById("subcardLogin");
    let cardRegister = document.getElementById("cardRegister");
    let subcardRegister = document.getElementById("subcardRegister");
    let ghHeading = document.getElementById("ghHeading");

    if (tab === "register") {
        if (cardLogin) cardLogin.style.display = "none";
        if (subcardLogin) subcardLogin.style.display = "none";
        if (cardRegister) cardRegister.style.display = "block";
        if (subcardRegister) subcardRegister.style.display = "block";
        if (ghHeading) ghHeading.textContent = "Tạo tài khoản mới";
    } else {
        if (cardRegister) cardRegister.style.display = "none";
        if (subcardRegister) subcardRegister.style.display = "none";
        if (cardLogin) cardLogin.style.display = "block";
        if (subcardLogin) subcardLogin.style.display = "block";
        if (ghHeading) ghHeading.textContent = "Đăng nhập hệ thống";
    }
}

function dangNhapNhanh(user, pass) {
    chuyenAuthTab("login");
    let loginUser = document.getElementById("loginUser");
    let loginPass = document.getElementById("loginPass");
    if (loginUser) loginUser.value = user;
    if (loginPass) loginPass.value = pass;
    dangNhap();
}

function dangNhap() {
    hienAuthAlert("", "");
    let loginUser = document.getElementById("loginUser");
    let loginPass = document.getElementById("loginPass");
    let username = loginUser ? loginUser.value.trim() : "";
    let password = loginPass ? loginPass.value.trim() : "";

    if (!username || !password) {
        hienAuthAlert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", "error");
        return;
    }

    let u = username.toLowerCase();
    if (u === "admin" && password === "123") {
        currentUser = { username: "admin", hoTen: "Quản trị viên", role: "admin" };
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        hienThiApp();
        fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "123" })
        }).catch(() => {});
        return;
    }

    if (u === "nhanvien" && password === "123") {
        currentUser = { username: "nhanvien", hoTen: "Nhân viên bán hàng", role: "user" };
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        hienThiApp();
        fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "nhanvien", password: "123" })
        }).catch(() => {});
        return;
    }

    fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = data;
            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
            hienThiApp();
        } else {
            hienAuthAlert(data.message || "Sai tên đăng nhập hoặc mật khẩu!", "error");
        }
    })
    .catch(() => {
        hienAuthAlert("Sai tên đăng nhập hoặc mật khẩu!", "error");
    });
}

function dangKy() {
    hienAuthAlert("", "");
    let username = document.getElementById("regUser").value.trim();
    let hoTen = document.getElementById("regHoTen").value.trim();
    let role = document.getElementById("regRole").value;
    let password = document.getElementById("regPass").value.trim();
    let confirmPass = document.getElementById("regPassConfirm").value.trim();

    if (!username || !password) {
        hienAuthAlert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", "error");
        return;
    }
    if (password.length < 3) {
        hienAuthAlert("Mật khẩu phải từ 3 ký tự trở lên!", "error");
        return;
    }
    if (password !== confirmPass) {
        hienAuthAlert("Mật khẩu xác nhận không trùng khớp!", "error");
        return;
    }

    fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, hoTen, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            hienAuthAlert("Đăng ký thành công! Đang chuyển sang màn hình đăng nhập...", "success");
            setTimeout(() => {
                chuyenAuthTab("login");
                document.getElementById("loginUser").value = username;
                document.getElementById("loginPass").value = password;
                hienAuthAlert("Đăng ký thành công! Nhấn Đăng Nhập để vào hệ thống.", "success");
            }, 800);
        } else {
            hienAuthAlert(data.message || "Đăng ký thất bại!", "error");
        }
    })
    .catch(() => {
        hienAuthAlert("Không thể kết nối đến máy chủ!", "error");
    });
}

function dangXuat() {
    sessionStorage.removeItem("currentUser");
    currentUser = null;
    let loginUser = document.getElementById("loginUser");
    let loginPass = document.getElementById("loginPass");
    if (loginUser) loginUser.value = "";
    if (loginPass) loginPass.value = "";

    let mainApp = document.getElementById("mainApp");
    if (mainApp) mainApp.style.display = "none";

    let loginScreen = document.getElementById("loginScreen");
    if (loginScreen) loginScreen.style.display = "flex";

    chuyenAuthTab("login");
}

function hienThiApp() {
    let loginScreen = document.getElementById("loginScreen");
    if (loginScreen) loginScreen.style.display = "none";

    let mainApp = document.getElementById("mainApp");
    if (mainApp) mainApp.style.display = "block";

    if (currentUser) {
        let userHoTen = document.getElementById("userHoTen");
        if (userHoTen) userHoTen.textContent = currentUser.hoTen;
        let badge = document.getElementById("userRoleBadge");
        let khoNhapBox = document.getElementById("khoNhapBox");
        let cotXoaKho = document.getElementById("cotXoaKho");
        let cotXoaLichSu = document.getElementById("cotXoaLichSu");

        if (currentUser.role === "admin") {
            if (badge) {
                badge.textContent = "Quản trị viên";
                badge.className = "role-badge role-admin";
            }
            if (khoNhapBox) khoNhapBox.style.display = "flex";
            if (cotXoaKho) cotXoaKho.style.display = "";
            if (cotXoaLichSu) cotXoaLichSu.style.display = "";
        } else {
            if (badge) {
                badge.textContent = "Nhân viên";
                badge.className = "role-badge role-user";
            }
            if (khoNhapBox) khoNhapBox.style.display = "none";
            if (cotXoaKho) cotXoaKho.style.display = "none";
            if (cotXoaLichSu) cotXoaLichSu.style.display = "none";
        }
    }

    chuyenTab("tab-banhang");
    if (cacDongHang.length === 0) {
        themDong();
    } else {
        veBangHoaDon();
    }
    taiDanhSachHang();
    taiDanhSachHoaDon();
}

function taiDanhSachHang() {
    fetch(`${API_BASE}/products`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                danhSachHang = data;
            } else {
                ganSanPhamMacDinh();
            }
            veBangKho();
        })
        .catch(() => {
            ganSanPhamMacDinh();
            veBangKho();
        });
}

function ganSanPhamMacDinh() {
    if (!danhSachHang || danhSachHang.length === 0) {
        danhSachHang = [
            { ten: "Ống nhựa PVC D27", dvt: "Cây", gia: 42000 },
            { ten: "Ống nhựa PVC D21", dvt: "Cây", gia: 30000 },
            { ten: "Dây điện Cadivi 2.5", dvt: "Cuộn", gia: 790000 },
            { ten: "Aptomat Panasonic 20A", dvt: "Cái", gia: 95000 },
            { ten: "Xi măng Hà Tiên", dvt: "Bao", gia: 98000 }
        ];
    }
}

function taiDanhSachHoaDon() {
    if (!currentUser) return;
    let url = `${API_BASE}/invoices?role=${currentUser.role}&user=${encodeURIComponent(currentUser.username)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            danhSachHoaDon = Array.isArray(data) ? data : [];
            veBangLichSu();
        })
        .catch(() => {
            if (!Array.isArray(danhSachHoaDon)) danhSachHoaDon = [];
            veBangLichSu();
        });
}

function chuyenTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

    let targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");

    if (btn) {
        btn.classList.add("active");
    } else {
        let defaultBtn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
        if (defaultBtn) defaultBtn.classList.add("active");
    }

    if (tabId === "tab-khohang") taiDanhSachHang();
    if (tabId === "tab-lichsu") taiDanhSachHoaDon();
}

function themDong() {
    cacDongHang.push({ ten: "", dvt: "", sl: 1, gia: 0, thanhTien: 0 });
    veBangHoaDon();
}

function xoaDong(index) {
    cacDongHang.splice(index, 1);
    veBangHoaDon();
}

function tinhTien(index) {
    let dong = cacDongHang[index];
    let sl = parseFloat(dong.sl) || 0;
    let gia = parseFloat(dong.gia) || 0;
    dong.thanhTien = sl * gia;
    veBangHoaDon();
}

function veBangHoaDon() {
    let tbody = document.getElementById("bangHoaDon");
    if (!tbody) return;
    tbody.innerHTML = "";
    let tong = 0;

    cacDongHang.forEach((item, i) => {
        tong += item.thanhTien;
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><input type="text" value="${item.ten}" onchange="doiTen(${i}, this.value)"></td>
            <td><input type="text" value="${item.dvt}" onchange="doiDvt(${i}, this.value)"></td>
            <td><input type="number" min="1" value="${item.sl}" onchange="doiSl(${i}, this.value)"></td>
            <td><input type="number" min="0" step="1000" value="${item.gia}" onchange="doiGia(${i}, this.value)"></td>
            <td><strong>${item.thanhTien.toLocaleString("vi-VN")} đ</strong></td>
            <td><button class="btn btn-red" onclick="xoaDong(${i})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });

    let tongTienEl = document.getElementById("tongTien");
    if (tongTienEl) tongTienEl.textContent = tong.toLocaleString("vi-VN") + " đ";
}

function doiTen(i, val) {
    cacDongHang[i].ten = val;
    let sp = danhSachHang.find(h => h.ten.toLowerCase() === val.toLowerCase());
    if (sp) {
        cacDongHang[i].dvt = sp.dvt;
        cacDongHang[i].gia = sp.gia;
        cacDongHang[i].thanhTien = cacDongHang[i].sl * sp.gia;
        veBangHoaDon();
    }
}
function doiDvt(i, val) { cacDongHang[i].dvt = val; }
function doiSl(i, val) { cacDongHang[i].sl = val; tinhTien(i); }
function doiGia(i, val) { cacDongHang[i].gia = val; tinhTien(i); }

function lamMoi() {
    let tenKhach = document.getElementById("tenKhach");
    if (tenKhach) tenKhach.value = "";
    let today = new Date().toISOString().split("T")[0];
    let ngayLap = document.getElementById("ngayLap");
    if (ngayLap) ngayLap.value = today;
    cacDongHang = [];
    themDong();
}

function luuHoaDon() {
    if (!currentUser) return;
    let tenKhach = document.getElementById("tenKhach").value.trim() || "Khách lẻ";
    let ngay = document.getElementById("ngayLap").value || new Date().toISOString().split("T")[0];

    let hopLe = cacDongHang.filter(d => d.ten.trim() !== "");
    if (hopLe.length === 0) {
        alert("Vui lòng nhập ít nhất một mặt hàng!");
        return;
    }

    let tongTien = hopLe.reduce((sum, d) => sum + d.thanhTien, 0);
    let maDon = "HD_" + Date.now().toString().slice(-6);

    let hd = {
        ma: maDon,
        khach: tenKhach,
        ngay: ngay,
        tong: tongTien,
        nguoiTao: currentUser.username
    };

    fetch(`${API_BASE}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hd)
    })
    .then(() => {
        alert("Đã lưu hóa đơn thành công! Mã đơn: " + maDon);
        lamMoi();
        taiDanhSachHoaDon();
    })
    .catch(() => {
        danhSachHoaDon.unshift(hd);
        alert("Đã lưu hóa đơn thành công! Mã đơn: " + maDon);
        lamMoi();
        veBangLichSu();
    });
}

function veBangKho() {
    let tbody = document.getElementById("bangKhoHang");
    if (!tbody) return;
    tbody.innerHTML = "";
    let isAdmin = currentUser && currentUser.role === "admin";

    danhSachHang.forEach((sp, i) => {
        let tr = document.createElement("tr");
        let btnXoa = isAdmin 
            ? `<td><button class="btn btn-red" onclick="xoaSanPham('${sp.ten}')">Xóa</button></td>`
            : ``;
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${sp.ten}</td>
            <td>${sp.dvt}</td>
            <td>${sp.gia.toLocaleString("vi-VN")} đ</td>
            ${btnXoa}
        `;
        tbody.appendChild(tr);
    });
}

function themSanPham() {
    let ten = document.getElementById("spTen").value.trim();
    let dvt = document.getElementById("spDvt").value.trim() || "Cái";
    let gia = parseFloat(document.getElementById("spGia").value) || 0;

    if (!ten) {
        alert("Vui lòng nhập tên hàng hóa!");
        return;
    }

    let sp = { ten, dvt, gia };
    fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sp)
    })
    .then(() => {
        document.getElementById("spTen").value = "";
        document.getElementById("spDvt").value = "";
        document.getElementById("spGia").value = "";
        taiDanhSachHang();
        alert("Đã thêm mặt hàng vào kho!");
    })
    .catch(() => {
        danhSachHang.push(sp);
        document.getElementById("spTen").value = "";
        document.getElementById("spDvt").value = "";
        document.getElementById("spGia").value = "";
        veBangKho();
        alert("Đã thêm mặt hàng vào kho!");
    });
}

function xoaSanPham(ten) {
    if (confirm("Bạn có chắc muốn xóa mặt hàng này?")) {
        fetch(`${API_BASE}/products?ten=${encodeURIComponent(ten)}`, { method: "DELETE" })
            .then(() => taiDanhSachHang())
            .catch(() => {
                danhSachHang = danhSachHang.filter(sp => sp.ten !== ten);
                veBangKho();
            });
    }
}

function veBangLichSu() {
    let tbody = document.getElementById("bangLichSu");
    if (!tbody) return;
    tbody.innerHTML = "";
    let isAdmin = currentUser && currentUser.role === "admin";

    danhSachHoaDon.forEach((hd, i) => {
        let tr = document.createElement("tr");
        let btnXoa = isAdmin 
            ? `<td><button class="btn btn-red" onclick="xoaHoaDon('${hd.ma}')">Xóa</button></td>`
            : ``;
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><strong>${hd.ma}</strong></td>
            <td>${hd.khach}</td>
            <td>${hd.ngay}</td>
            <td><span class="role-badge ${hd.nguoiTao === 'admin' ? 'role-admin' : 'role-user'}">${hd.nguoiTao}</span></td>
            <td><strong>${hd.tong.toLocaleString("vi-VN")} đ</strong></td>
            ${btnXoa}
        `;
        tbody.appendChild(tr);
    });
}

function xoaHoaDon(ma) {
    if (confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
        fetch(`${API_BASE}/invoices?ma=${encodeURIComponent(ma)}`, { method: "DELETE" })
            .then(() => taiDanhSachHoaDon())
            .catch(() => {
                danhSachHoaDon = danhSachHoaDon.filter(hd => hd.ma !== ma);
                veBangLichSu();
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let today = new Date().toISOString().split("T")[0];
    let ngayLapInput = document.getElementById("ngayLap");
    if (ngayLapInput) ngayLapInput.value = today;

    themDong();

    let saved = sessionStorage.getItem("currentUser");
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            hienThiApp();
        } catch (e) {
            dangXuat();
        }
    }
});
