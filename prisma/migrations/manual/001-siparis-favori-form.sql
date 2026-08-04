-- ═══════════════════════════════════════════════════════════════════════════
-- Bayırlıoğlu — Şema güncellemesi
-- Supabase SQL Editor'de bir kez çalıştırın.
-- Tümü IF NOT EXISTS ile yazıldı; tekrar çalıştırmak zararsızdır.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. SİPARİŞ: tutar dökümü ──────────────────────────────────────────────
-- Kargo ücreti ayrı saklanmadığı için sipariş detayında yanlış ara toplam
-- gösteriliyordu. Artık her kalem ayrı tutuluyor.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal      NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee  NUMERIC(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount    NUMERIC(10,2);

-- ─── 2. SİPARİŞ: teslimat adresi anlık kopyası ─────────────────────────────
-- Müşteri adresini silince geçmiş siparişin teslimat bilgisi kayboluyordu.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_full_name   VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_phone       VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_line1       VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_line2       VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_district    VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_city        VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_postal_code VARCHAR(10);

-- ─── 3. SİPARİŞ: kargo takibi ──────────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier         VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at      TIMESTAMP(3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at    TIMESTAMP(3);

-- ─── 4. SİPARİŞ: stok/ödeme yönetimi ───────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_reduced BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id    VARCHAR(100);

-- Callback token'la sipariş arıyor; indeks olmadan tablo büyüdükçe yavaşlar
CREATE INDEX IF NOT EXISTS orders_payment_token_idx ON orders (payment_token);

-- Mevcut siparişler için tutar dökümünü doldur (kargo ücreti bilinmiyor,
-- toplam ara toplam kabul ediliyor)
UPDATE orders SET subtotal = total_amount WHERE subtotal IS NULL;
UPDATE orders SET shipping_fee = 0        WHERE shipping_fee IS NULL;

-- Ödemesi tamamlanmış eski siparişlerde stok zaten elle yönetildiği için
-- tekrar düşülmesin diye işaretle
UPDATE orders SET stock_reduced = TRUE WHERE payment_status = 'paid';

-- ─── 5. FAVORİLER ──────────────────────────────────────────────────────────
-- Favori butonu yalnızca ekranda çalışıyordu, hiçbir yere kaydedilmiyordu.

CREATE TABLE IF NOT EXISTS favorites (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favorites_user_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT favorites_product_fkey
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_product_key
  ON favorites (user_id, product_id);
CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites (user_id);

-- ─── 6. İLETİŞİM MESAJLARI ─────────────────────────────────────────────────
-- İletişim formu verisi console.log'a gidiyordu; hiçbir mesaj kaydedilmiyordu.

CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  brand_key  VARCHAR(30),
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(30),
  subject    VARCHAR(150),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at);
CREATE INDEX IF NOT EXISTS contact_messages_read_idx    ON contact_messages (is_read);

-- ─── 7. BAYİ BAŞVURULARI ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dealer_applications (
  id             TEXT PRIMARY KEY,
  company_name   VARCHAR(200) NOT NULL,
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(30)  NOT NULL,
  city           VARCHAR(100) NOT NULL,
  district       VARCHAR(100),
  brand_interest VARCHAR(60),
  business_type  VARCHAR(80),
  annual_revenue VARCHAR(80),
  message        TEXT,
  status         VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS dealer_applications_created_idx ON dealer_applications (created_at);
CREATE INDEX IF NOT EXISTS dealer_applications_status_idx  ON dealer_applications (status);

-- ═══════════════════════════════════════════════════════════════════════════
-- Kontrol
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'orders yeni sütunlar' AS kontrol, COUNT(*) AS adet
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('subtotal','shipping_fee','ship_full_name','tracking_number','stock_reduced');

SELECT 'yeni tablolar' AS kontrol, COUNT(*) AS adet
FROM information_schema.tables
WHERE table_name IN ('favorites','contact_messages','dealer_applications');
