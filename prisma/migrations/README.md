# Bu klasör hakkında — ÖNCE OKUYUN

Bu projede **Prisma migrate kullanılmıyor.** Şema değişiklikleri
`prisma db push` ile, ek tablo/indeksler ise `manual/` altındaki SQL
dosyalarıyla, Supabase SQL Editor'de elle uygulanıyor.

## Klasörde ne var

`20260630095127_init/`, `20260701044332_add_user_order_models/` ve
`20260702013453_add_payment_fields/` klasörleri projenin ilk günlerinden
kalma Prisma migration dosyaları. **Hepsi veritabanına uygulanmış durumda.**
Tarihsel kayıt olarak duruyorlar; silinmemeleri gerekiyor ama çalıştırılmaları
da gerekmiyor.

`manual/001-siparis-favori-form.sql` asıl kullanılan dosya. Baştan sona
`IF NOT EXISTS` ile yazıldığı için tekrar tekrar çalıştırmak güvenli.
Yeni bir bölüm eklendiğinde ("EK 5", "EK 6", "EK 7" …) dosyanın tamamını
Supabase'de yeniden çalıştırmak yeterli.

## ÖNEMLİ: bu üç migration veritabanını yeniden kuramaz

Boş bir veritabanına yalnızca bu üçünü uygularsanız eksik kalır.
`products.product_brand` ve `products.vat_rate` gibi sütunları hiçbiri
oluşturmuyor — onlar `prisma db push` ile eklendi ve o komut migration
dosyası üretmez.

Sıfırdan kurulum gerekirse (yeni test ortamı, sunucu değişikliği, kaza
sonrası geri dönüş) doğru sıra şudur:

```bash
npx prisma db push          # 1. şemadaki her şeyi oluşturur
# 2. Supabase SQL Editor'de manual/001-siparis-favori-form.sql
npm run db:seed             # 3. marka ve kategoriler
```

## `prisma migrate deploy` / `migrate dev` ÇALIŞTIRMAYIN

Prisma uygulanmış migration'ları veritabanındaki `_prisma_migrations`
tablosunda takip eder. SQL'ler elle çalıştırıldığı için bu tabloda kayıt
yoktur.

- `migrate deploy` bu üç dosyayı "hiç uygulanmamış" sanıp çalıştırmaya
  kalkar ve `relation "brands" already exists` hatası verir.
- `migrate dev` daha tehlikelidir: şema ile veritabanı arasında fark
  görünce **veritabanını sıfırlamayı teklif eder.** Üretim veritabanında
  bu, tüm siparişlerin silinmesi demektir.

Bu yüzden `npm run db:migrate` komutu bilerek devre dışı bırakıldı.

## Uygulanma durumunu nasıl kontrol ederim

Supabase SQL Editor'de `manual/veritabani-kontrol.sql` dosyasını çalıştırın.
Hiçbir şeyi değiştirmez, sadece hangi bölümün uygulandığını listeler.
