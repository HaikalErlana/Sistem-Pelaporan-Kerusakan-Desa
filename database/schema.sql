-- =====================================================
-- PROJECT: Sistem Informasi Pelaporan Kerusakan
--          Fasilitas Umum Desa
-- DATABASE: PostgreSQL
-- FILE: database/schema.sql
-- =====================================================

-- 1. TABEL WARGA
CREATE TABLE warga (
    warga_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL KATEGORI KERUSAKAN
CREATE TABLE kategori_kerusakan (
    kategori_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT
);

-- 3. TABEL LOKASI FASILITAS
CREATE TABLE lokasi_fasilitas (
    lokasi_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_fasilitas VARCHAR(150) NOT NULL,
    alamat TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
);

-- 4. TABEL PETUGAS
CREATE TABLE petugas (
    petugas_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100),
    no_telepon VARCHAR(20),
    email VARCHAR(150) UNIQUE
);

-- 5. TABEL LAPORAN KERUSAKAN
CREATE TABLE laporan_kerusakan (
    laporan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warga_id BIGINT NOT NULL
        REFERENCES warga(warga_id),
    kategori_id BIGINT NOT NULL
        REFERENCES kategori_kerusakan(kategori_id),
    lokasi_id BIGINT NOT NULL
        REFERENCES lokasi_fasilitas(lokasi_id),
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT NOT NULL,
    foto_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'dilaporkan'
        CHECK (status IN (
            'dilaporkan',
            'diverifikasi',
            'ditangani',
            'selesai',
            'ditolak'
        )),
    tanggal_laporan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL VERIFIKASI LAPORAN
-- UNIQUE pada laporan_id memastikan satu laporan
-- memiliki maksimal satu baris verifikasi.
CREATE TABLE verifikasi_laporan (
    verifikasi_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    laporan_id BIGINT NOT NULL UNIQUE
        REFERENCES laporan_kerusakan(laporan_id),
    petugas_id BIGINT NOT NULL
        REFERENCES petugas(petugas_id),
    hasil_verifikasi VARCHAR(20) NOT NULL
        CHECK (hasil_verifikasi IN ('valid', 'tidak_valid')),
    catatan TEXT,
    tanggal_verifikasi TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL PENGHUBUNG LAPORAN DAN PETUGAS
-- Tabel ini membentuk relasi many-to-many.
CREATE TABLE penugasan_petugas (
    laporan_id BIGINT NOT NULL
        REFERENCES laporan_kerusakan(laporan_id),
    petugas_id BIGINT NOT NULL
        REFERENCES petugas(petugas_id),
    tanggal_penugasan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    peran VARCHAR(100),
    PRIMARY KEY (laporan_id, petugas_id)
);