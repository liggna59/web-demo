export interface NguoiDung {
    username: string;
    hoTen: string;
    role: "admin" | "user";
}

export interface SanPham {
    ten: string;
    dvt: string;
    gia: number;
}

export interface DongHang {
    ten: string;
    dvt: string;
    sl: number;
    gia: number;
    thanhTien: number;
}

export interface HoaDon {
    ma: string;
    khach: string;
    ngay: string;
    tong: number;
    nguoiTao: string;
}

export interface DangKyYeuCau {
    username: string;
    password: string;
    hoTen: string;
    role: "admin" | "user";
}
