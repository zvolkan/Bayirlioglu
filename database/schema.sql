-- =============================================================================
-- BAYIRLIOGLU E-TİCARET — PostgreSQL Veritabanı Şeması
-- Markalar: ALB Tarım & Albsu Teknolojileri
-- =============================================================================
-- Çalıştırmak için: psql -U postgres -d bayirlioglu_db -f schema.sql
-- Önce: CREATE DATABASE bayirlioglu_db;
-- =============================================================================

-- UUID fonksiyonu (PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. MARKALAR (brands)
-- =============================================================================
CREATE TABLE brands (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(30)  UNIQUE NOT NULL,   -- 'alb-tarim' | 'alb-su-aritma'
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url    VARCHAR(500),
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO brands (key, name, description) VALUES
  ('alb-tarim',     'ALB Tarım',            'Tarımsal çözümler: gübre, sulama, ilaç'),
  ('alb-su-aritma', 'Albsu Teknolojileri',  'Su arıtma, klima ve elektronik ev eşyaları');

-- =============================================================================
-- 2. KATEGORİLER (categories) — Hiyerarşik (üst/alt kategoriler)
-- =============================================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  brand_id    INT          NOT NULL REFERENCES brands(id),
  parent_id   INT          REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  icon        VARCHAR(100),           -- emoji veya icon sınıfı
  sort_order  INT          DEFAULT 0,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_categories_brand    ON categories(brand_id);
CREATE INDEX idx_categories_parent   ON categories(parent_id);
CREATE INDEX idx_categories_slug     ON categories(slug);

-- =============================================================================
-- 3. KULLANICILAR (users)
-- =============================================================================
CREATE TABLE users (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  phone            VARCHAR(20),
  role             VARCHAR(20)  NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('customer', 'admin', 'dealer')),
  brand_preference VARCHAR(30)
                                CHECK (brand_preference IN ('alb-tarim', 'alb-su-aritma', 'both')),
  email_verified   BOOLEAN      DEFAULT FALSE,
  avatar_url       VARCHAR(500),
  last_login_at    TIMESTAMPTZ,
  is_active        BOOLEAN      DEFAULT TRUE,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- =============================================================================
-- 4. ADRESLER (addresses)
-- =============================================================================
CREATE TABLE addresses (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(100) NOT NULL,           -- 'Ev', 'İş Yeri', 'Tarla'
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  city         VARCHAR(100) NOT NULL,
  district     VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  address_line TEXT         NOT NULL,
  postal_code  VARCHAR(10),
  is_default   BOOLEAN      DEFAULT FALSE,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- =============================================================================
-- 5. ÜRÜNLER (products)
-- =============================================================================
CREATE TABLE products (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       INT           NOT NULL REFERENCES categories(id),
  brand_id          INT           NOT NULL REFERENCES brands(id),
  name              VARCHAR(255)  NOT NULL,
  slug              VARCHAR(255)  UNIQUE NOT NULL,
  description       TEXT,
  short_description VARCHAR(500),
  sku               VARCHAR(100)  UNIQUE,
  barcode           VARCHAR(100),

  -- Fiyatlandırma
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  sale_price        NUMERIC(10,2) CHECK (sale_price >= 0),

  -- Stok
  stock_quantity    INT           NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  min_stock_level   INT           DEFAULT 5,         -- düşük stok uyarı eşiği

  -- Fiziksel özellikler
  unit              VARCHAR(50)   DEFAULT 'adet',    -- adet, kg, litre, set...
  weight            NUMERIC(8,3),                    -- kg

  -- Durum
  is_active         BOOLEAN       DEFAULT TRUE,
  is_featured       BOOLEAN       DEFAULT FALSE,

  -- SEO
  meta_title        VARCHAR(255),
  meta_description  TEXT,

  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_brand     ON products(brand_id);
CREATE INDEX idx_products_slug      ON products(slug);
CREATE INDEX idx_products_featured  ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active    ON products(is_active)   WHERE is_active   = TRUE;
CREATE INDEX idx_products_sku       ON products(sku);

-- =============================================================================
-- 6. ÜRÜN GÖRSELLERİ (product_images)
-- =============================================================================
CREATE TABLE product_images (
  id          SERIAL       PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(255),
  sort_order  INT          DEFAULT 0,
  is_primary  BOOLEAN      DEFAULT FALSE
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- =============================================================================
-- 7. TEKNİK ÖZELLİKLER (product_specifications)
-- =============================================================================
CREATE TABLE product_specifications (
  id          SERIAL       PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_name   VARCHAR(100) NOT NULL,   -- 'Kapasite', 'Güç', 'Boyutlar'
  spec_value  VARCHAR(255) NOT NULL,
  spec_unit   VARCHAR(50),             -- 'kg', 'litre', 'BTU'
  sort_order  INT          DEFAULT 0
);

CREATE INDEX idx_specs_product ON product_specifications(product_id);

-- =============================================================================
-- 8. ETİKETLER (tags)
-- =============================================================================
CREATE TABLE tags (
  id    SERIAL       PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL,
  slug  VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE product_tags (
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id      INT  REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- =============================================================================
-- 9. SİPARİŞLER (orders)
-- =============================================================================
CREATE TABLE orders (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          REFERENCES users(id) ON DELETE SET NULL,
  brand_id         INT           REFERENCES brands(id),
  order_number     VARCHAR(50)   UNIQUE NOT NULL,

  -- Durum
  status           VARCHAR(30)   NOT NULL DEFAULT 'pending'
                                 CHECK (status IN (
                                   'pending', 'confirmed', 'processing',
                                   'shipped', 'delivered', 'cancelled', 'refunded'
                                 )),

  -- Fiyatlandırma
  subtotal         NUMERIC(10,2) NOT NULL,
  discount_amount  NUMERIC(10,2) DEFAULT 0,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  tax_amount       NUMERIC(10,2) DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL,

  -- Kargo Adresi (snapshot — kullanıcı adresini sonradan değiştirse sipariş etkilenmez)
  shipping_first_name  VARCHAR(100) NOT NULL,
  shipping_last_name   VARCHAR(100) NOT NULL,
  shipping_phone       VARCHAR(20),
  shipping_city        VARCHAR(100) NOT NULL,
  shipping_district    VARCHAR(100) NOT NULL,
  shipping_address     TEXT         NOT NULL,
  shipping_postal_code VARCHAR(10),

  -- Ödeme
  payment_method  VARCHAR(50)
                  CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash_on_delivery')),
  payment_status  VARCHAR(30) DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_ref     VARCHAR(255),   -- Ödeme sağlayıcısından gelen referans no

  -- Kargo
  cargo_company    VARCHAR(100),
  tracking_number  VARCHAR(100),

  -- Kupon
  coupon_id        INT REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code      VARCHAR(50),    -- snapshot

  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_number     ON orders(order_number);
CREATE INDEX idx_orders_created    ON orders(created_at DESC);
CREATE INDEX idx_orders_brand      ON orders(brand_id);

-- =============================================================================
-- 10. SİPARİŞ KALEMLERİ (order_items) — Sipariş Detayları
-- =============================================================================
CREATE TABLE order_items (
  id            SERIAL        PRIMARY KEY,
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID          REFERENCES products(id) ON DELETE SET NULL,

  -- Snapshot (sipariş anındaki ürün bilgileri — ürün sonradan değişse etkilenmez)
  product_name  VARCHAR(255)  NOT NULL,
  product_sku   VARCHAR(100),
  product_image VARCHAR(500),
  unit_price    NUMERIC(10,2) NOT NULL,
  quantity      INT           NOT NULL CHECK (quantity > 0),
  total_price   NUMERIC(10,2) NOT NULL,   -- unit_price * quantity

  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =============================================================================
-- 11. SEPET (carts & cart_items)
-- =============================================================================
CREATE TABLE carts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  session_id  VARCHAR(255),          -- misafir kullanıcılar için
  brand_id    INT          REFERENCES brands(id),
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE cart_items (
  id          SERIAL      PRIMARY KEY,
  cart_id     UUID        NOT NULL REFERENCES carts(id)    ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT         NOT NULL CHECK (quantity > 0),
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart    ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- =============================================================================
-- 12. FAVORİLER / İSTEK LİSTESİ (wishlists)
-- =============================================================================
CREATE TABLE wishlists (
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- =============================================================================
-- 13. YORUMLAR (reviews)
-- =============================================================================
CREATE TABLE reviews (
  id            SERIAL      PRIMARY KEY,
  product_id    UUID        NOT NULL REFERENCES products(id)     ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  order_item_id INT         REFERENCES order_items(id)           ON DELETE SET NULL,
  rating        SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         VARCHAR(255),
  body          TEXT,
  is_approved   BOOLEAN     DEFAULT FALSE,
  is_verified   BOOLEAN     DEFAULT FALSE,   -- satın alan kullanıcı yorumu
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)               -- bir kullanıcı bir ürüne tek yorum
);

CREATE INDEX idx_reviews_product  ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = TRUE;

-- =============================================================================
-- 14. KUPONLAR (coupons)
-- =============================================================================
CREATE TABLE coupons (
  id               SERIAL        PRIMARY KEY,
  code             VARCHAR(50)   UNIQUE NOT NULL,
  description      VARCHAR(255),
  discount_type    VARCHAR(20)   NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value   NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10,2),
  max_discount     NUMERIC(10,2),         -- yüzde kuponlar için maksimum indirim tutarı
  max_uses         INT,
  used_count       INT           DEFAULT 0,
  brand_id         INT           REFERENCES brands(id),  -- null = tüm markalar
  is_active        BOOLEAN       DEFAULT TRUE,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

-- coupons tablosunu orders'dan önce declare etmek için
-- NOT: orders tablosu coupon_id'ye foreign key tutuyor, bu yüzden
-- coupons tablosu orders'tan önce oluşturulmalıdır.
-- (Aşağıdaki ALTER ile ilişkiyi tamamlıyoruz)
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_coupon
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- =============================================================================
-- 15. BLOG YAZILARI (blog_posts)
-- =============================================================================
CREATE TABLE blog_posts (
  id               SERIAL       PRIMARY KEY,
  brand_id         INT          REFERENCES brands(id),
  author_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  excerpt          TEXT,
  content          TEXT         NOT NULL,
  cover_image_url  VARCHAR(500),
  read_time_min    SMALLINT,               -- tahmini okuma süresi (dakika)
  is_published     BOOLEAN      DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  meta_title       VARCHAR(255),
  meta_description TEXT,
  view_count       INT          DEFAULT 0,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE blog_tags (
  blog_post_id  INT REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id        INT REFERENCES tags(id)       ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, tag_id)
);

CREATE INDEX idx_blog_slug      ON blog_posts(slug);
CREATE INDEX idx_blog_brand     ON blog_posts(brand_id);
CREATE INDEX idx_blog_published ON blog_posts(is_published, published_at DESC);

-- =============================================================================
-- 16. HİZMETLER (services)
-- =============================================================================
CREATE TABLE services (
  id          SERIAL       PRIMARY KEY,
  brand_id    INT          NOT NULL REFERENCES brands(id),
  title       VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(100),
  price_label VARCHAR(100),    -- 'Ücretsiz', 'Fiyat almak için arayın', vs.
  sort_order  INT          DEFAULT 0,
  is_active   BOOLEAN      DEFAULT TRUE
);

CREATE TABLE service_features (
  id          SERIAL       PRIMARY KEY,
  service_id  INT          NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  feature     VARCHAR(255) NOT NULL,
  sort_order  INT          DEFAULT 0
);

-- =============================================================================
-- 17. BAYİ BAŞVURULARI (dealer_applications)
-- =============================================================================
CREATE TABLE dealer_applications (
  id               SERIAL       PRIMARY KEY,
  company_name     VARCHAR(255) NOT NULL,
  contact_name     VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  city             VARCHAR(100) NOT NULL,
  district         VARCHAR(100),
  message          TEXT,
  brand_interest   VARCHAR(30)
                   CHECK (brand_interest IN ('alb-tarim', 'alb-su-aritma', 'both')),
  status           VARCHAR(30)  DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by      UUID         REFERENCES users(id),
  review_note      TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

-- =============================================================================
-- 18. İLETİŞİM FORMLARI (contact_messages)
-- =============================================================================
CREATE TABLE contact_messages (
  id          SERIAL       PRIMARY KEY,
  brand_id    INT          REFERENCES brands(id),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  is_read     BOOLEAN      DEFAULT FALSE,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 19. BÜLTEN ABONELERİ (newsletter_subscribers)
-- =============================================================================
CREATE TABLE newsletter_subscribers (
  id          SERIAL       PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  brand_id    INT          REFERENCES brands(id),
  is_active   BOOLEAN      DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- =============================================================================
-- 20. AYARLAR (settings) — Admin paneli için genel site ayarları
-- =============================================================================
CREATE TABLE settings (
  id         SERIAL       PRIMARY KEY,
  brand_id   INT          REFERENCES brands(id),
  key        VARCHAR(100) NOT NULL,
  value      TEXT,
  type       VARCHAR(30)  DEFAULT 'string',  -- 'string', 'number', 'boolean', 'json'
  UNIQUE (brand_id, key)
);

-- =============================================================================
-- FONKSİYONLAR & TRİGGERLAR
-- =============================================================================

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sipariş numarası otomatik üretme
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1000;

CREATE TRIGGER trg_orders_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Stok düşme (sipariş onaylandığında)
CREATE OR REPLACE FUNCTION decrease_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE products p
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrease_stock
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION decrease_stock_on_order();

-- =============================================================================
-- GÖRÜNÜMLER (VIEWS)
-- =============================================================================

-- Ürün özeti (ortalama puan ve yorum sayısı dahil)
CREATE VIEW product_summary AS
SELECT
  p.*,
  b.name                                    AS brand_name,
  b.key                                     AS brand_key,
  c.name                                    AS category_name,
  c.slug                                    AS category_slug,
  COALESCE(AVG(r.rating), 0)               AS avg_rating,
  COUNT(r.id)                               AS review_count,
  pi_main.url                               AS primary_image_url
FROM products p
JOIN brands     b  ON p.brand_id    = b.id
JOIN categories c  ON p.category_id = c.id
LEFT JOIN reviews      r       ON r.product_id  = p.id AND r.is_approved = TRUE
LEFT JOIN product_images pi_main ON pi_main.product_id = p.id AND pi_main.is_primary = TRUE
WHERE p.is_active = TRUE
GROUP BY p.id, b.id, c.id, pi_main.url;

-- Sipariş özeti
CREATE VIEW order_summary AS
SELECT
  o.*,
  u.first_name || ' ' || u.last_name AS customer_name,
  u.email                             AS customer_email,
  COUNT(oi.id)                        AS item_count
FROM orders o
LEFT JOIN users       u  ON o.user_id  = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.first_name, u.last_name, u.email;
