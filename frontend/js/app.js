const API_BASE = "http://localhost:8080/api";

let danhSachHang = [];
let danhSachHoaDon = [];
let cacDongHang = [];

async function taiDanhSachHang() {
    try {
        let res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
            danhSachHang = await res.json();
            veBangKho();
        }
    } catch (e) {
        console.error("Loi ket noi Backend:", e);
    }
}

async function taiDanhSachHoaDon() {
    try {
        let res = await fetch(`${API_BASE}/invoices`);
        if (res.ok) {
            danhSachHoaDon = await res.json();
            if (!Array.isArray(danhSachHoaDon)) danhSachHoaDon = [];
            veBangLichSu();
        }
    } catch (e) {
        console.error("Loi ket noi Backend:", e);
    }
}

function chuyenTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    if (btn) {
        btn.classList.add("active");
    } else if (window.event && window.event.target) {
        window.event.target.classList.add("active");
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

    document.getElementById("tongTien").textContent = tong.toLocaleString("vi-VN") + " đ";
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

async function luuHoaDon() {
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
        tong: tongTien
    };

    try {
        let res = await fetch(`${API_BASE}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hd)
        });
        if (res.ok) {
            alert("Đã lưu hóa đơn thành công! Mã đơn: " + maDon);
            lamMoi();
            taiDanhSachHoaDon();
        }
    } catch (e) {
        alert("Không thể kết nối đến Backend!");
    }
}

function lamMoi() {
    document.getElementById("tenKhach").value = "";
    cacDongHang = [];
    themDong();
}

function veBangKho() {
    let tbody = document.getElementById("bangKhoHang");
    tbody.innerHTML = "";
    danhSachHang.forEach((sp, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${sp.ten}</td>
            <td>${sp.dvt}</td>
            <td>${sp.gia.toLocaleString("vi-VN")} đ</td>
            <td><button class="btn btn-red" onclick="xoaSanPham('${sp.ten}')">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function themSanPham() {
    let ten = document.getElementById("spTen").value.trim();
    let dvt = document.getElementById("spDvt").value.trim() || "Cái";
    let gia = parseFloat(document.getElementById("spGia").value) || 0;

    if (!ten) {
        alert("Vui lòng nhập tên hàng hóa!");
        return;
    }

    try {
        let res = await fetch(`${API_BASE}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ten, dvt, gia })
        });
        if (res.ok) {
            document.getElementById("spTen").value = "";
            document.getElementById("spDvt").value = "";
            document.getElementById("spGia").value = "";
            taiDanhSachHang();
            alert("Đã thêm mặt hàng vào kho!");
        }
    } catch (e) {
        alert("Không thể kết nối đến Backend!");
    }
}

async function xoaSanPham(ten) {
    if (confirm("Bạn có chắc muốn xóa mặt hàng này?")) {
        try {
            await fetch(`${API_BASE}/products?ten=${encodeURIComponent(ten)}`, { method: "DELETE" });
            taiDanhSachHang();
        } catch (e) {
            alert("Không thể kết nối đến Backend!");
        }
    }
}

function veBangLichSu() {
    let tbody = document.getElementById("bangLichSu");
    tbody.innerHTML = "";
    if (!danhSachHoaDon || danhSachHoaDon.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888;">Chưa có hóa đơn nào</td></tr>`;
        return;
    }
    danhSachHoaDon.forEach((hd, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><strong>${hd.ma}</strong></td>
            <td>${hd.khach}</td>
            <td>${hd.ngay}</td>
            <td><strong style="color: #16a34a;">${hd.tong.toLocaleString("vi-VN")} đ</strong></td>
            <td><button class="btn btn-red" onclick="xoaHoaDon('${hd.ma}')">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function xoaHoaDon(ma) {
    if (confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
        try {
            await fetch(`${API_BASE}/invoices?ma=${encodeURIComponent(ma)}`, { method: "DELETE" });
            taiDanhSachHoaDon();
        } catch (e) {
            alert("Không thể kết nối đến Backend!");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let today = new Date().toISOString().split("T")[0];
    document.getElementById("ngayLap").value = today;

    taiDanhSachHang();
    taiDanhSachHoaDon();
    themDong();
});
