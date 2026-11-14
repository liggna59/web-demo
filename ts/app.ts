import { SanPham, DongHang, HoaDon } from './types';

let danhSachHang: SanPham[] = [];
let danhSachHoaDon: HoaDon[] = [];
let cacDongHang: DongHang[] = [];

export function tinhThanhTien(sl: number, gia: number): number {
    return sl * gia;
}

export function tinhTongTien(ds: DongHang[]): number {
    return ds.reduce((tong, d) => tong + d.thanhTien, 0);
}
