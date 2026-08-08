-- ═══════════════════════════════════════════════════════════════════════════
-- SADECE OKUR — hiçbir şey değiştirmez.
-- Supabase SQL Editor'de çalıştırın; üç migration'ın uygulanıp uygulanmadığını
-- söyler.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  '1) init'                       AS migration,
  CASE WHEN COUNT(*) = 7 THEN 'UYGULANMIŞ' ELSE 'EKSİK (' || COUNT(*) || '/7 tablo)' END AS durum
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('brands','categories','products','product_images',
                     'product_specifications','tags','product_tags')

UNION ALL

SELECT
  '2) add_user_order_models',
  CASE WHEN COUNT(*) = 4 THEN 'UYGULANMIŞ' ELSE 'EKSİK (' || COUNT(*) || '/4 tablo)' END
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users','addresses','orders','order_items')

UNION ALL

SELECT
  '3) add_payment_fields',
  CASE WHEN COUNT(*) = 2 THEN 'UYGULANMIŞ' ELSE 'EKSİK (' || COUNT(*) || '/2 sütun)' END
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('payment_status','payment_token')

UNION ALL

SELECT
  '4) manuel SQL (benim verdiğim)',
  CASE WHEN COUNT(*) = 5 THEN 'UYGULANMIŞ'
       ELSE 'EKSİK — 001-siparis-favori-form.sql çalıştırın (' || COUNT(*) || '/5)' END
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('favorites','contact_messages','dealer_applications',
                     'return_requests','blog_posts')

UNION ALL

SELECT
  '5) sipariş numarası (EK 7)',
  CASE WHEN COUNT(*) = 1 THEN 'UYGULANMIŞ' ELSE 'EKSİK — manuel SQL''i yeniden çalıştırın' END
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'order_number'

UNION ALL

SELECT
  '6) prisma db push ile gelenler',
  CASE WHEN COUNT(*) = 2 THEN 'VAR' ELSE 'EKSİK (' || COUNT(*) || '/2 sütun)' END
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('product_brand','vat_rate');
