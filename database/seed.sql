-- =============================================================================
-- BAYIRLIOGLU — Örnek Seed Verisi (geliştirme ortamı)
-- Çalıştırmak için: psql -U postgres -d bayirlioglu_db -f seed.sql
-- =============================================================================

-- Kategoriler — ALB Tarım
INSERT INTO categories (brand_id, name, slug, icon, sort_order) VALUES
  (1, 'Gübreler',            'gubreler',   '🌿', 1),
  (1, 'Sulama Sistemleri',   'sulama',     '💧', 2),
  (1, 'Tarım İlaçları',      'ilac',       '🧪', 3),
  (1, 'Tarım Teknolojileri', 'teknoloji',  '🚁', 4),
  (1, 'Tohum & Fide',        'tohum',      '🌱', 5),
  (1, 'Toprak İyileştirici', 'toprak',     '🪨', 6);

-- Kategoriler — Albsu Teknolojileri
INSERT INTO categories (brand_id, name, slug, icon, sort_order) VALUES
  (2, 'Su Arıtma Sistemleri', 'su-aritma',   '🚿', 1),
  (2, 'Klima Sistemleri',     'klima',       '❄️',  2),
  (2, 'Ev Elektroniği',       'elektronik',  '📱', 3),
  (2, 'Yedek Parça & Filtre', 'yedek-parca', '🔧', 4);

-- Etiketler
INSERT INTO tags (name, slug) VALUES
  ('Organik',       'organik'),
  ('Yeni Ürün',     'yeni-urun'),
  ('Çok Satan',     'cok-satan'),
  ('Kampanya',      'kampanya'),
  ('Yerli Üretim',  'yerli-uretim'),
  ('İthalat',       'ithalat');

-- Admin kullanıcısı (şifreyi bcrypt ile hashlemeyi unutmayın!)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
  ('admin@albgrup.com.tr', '$2b$10$PLACEHOLDER_HASH', 'Admin', 'Kullanıcı', 'admin');

-- Site ayarları
INSERT INTO settings (brand_id, key, value, type) VALUES
  (1, 'free_shipping_threshold', '500',     'number'),
  (1, 'tax_rate',                '18',      'number'),
  (1, 'cargo_price',             '29.90',   'number'),
  (2, 'free_shipping_threshold', '1000',    'number'),
  (2, 'tax_rate',                '18',      'number'),
  (2, 'cargo_price',             '49.90',   'number');
