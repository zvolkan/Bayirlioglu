/**
 * Genel yükleme ekranı.
 *
 * Projede hiç `loading.tsx` yoktu; sayfa geçişlerinde ekran donuk kalıyordu.
 * Bu dosya sunucu bileşeni verisi beklenirken iskelet gösterir.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-10 h-10 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Yükleniyor…</p>
    </div>
  )
}
