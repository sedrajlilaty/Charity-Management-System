// ui/ImageUpload.jsx
import { useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

/**
 * @param {string|null} value     - base64 string أو null
 * @param {function}    onChange  - (base64|null) => void
 * @param {string}      label
 * @param {number}      maxHeight - ارتفاع الـ preview
 */
export default function ImageUpload({
  value,
  onChange,
  label     = 'اضغط أو اسحب الصورة هنا',
  maxHeight = 200,
}) {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => onChange?.(e.target.result)
    reader.readAsDataURL(file)
  }

  // ✅ الـ input صار برا الـ if/else حتى يضل موجود بالـ DOM بالحالتين
  // (كان قبل جوا الـ return الثانية بس، فما كان فيه وجود أصلاً بوضع المعاينة)
  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => handleFile(e.target.files[0])}
    />
  )

  if (value) {
    return (
      <div
        // ✅ جديد — نفس منطق السحب والإفلات تبع وضع الـ dropzone، بس هلق شغال
        // حتى لو أصلاً في صورة معروضة، فبيصير ممكن تستبدليها مباشرة
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-default)' }}
      >
        <img
          src={value}
          alt="preview"
          // ✅ جديد — الضغط على الصورة نفسها بيفتح اختيار ملف بديل
          onClick={() => inputRef.current?.click()}
          style={{ width: '100%', height: maxHeight, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '10px',
          pointerEvents: 'none', // حتى الـ overlay ما يمنع الضغط عالصورة تحته
        }}>
          {/* ✅ جديد — تلميح واضح إنو الصورة قابلة للاستبدال */}
          <span style={{
            fontSize: '0.7rem', color: '#fff', fontWeight: 600,
            background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: 6,
          }}>
            اضغطي للاستبدال
          </span>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange?.(null) }}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(239,68,68,0.9)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
              pointerEvents: 'auto', // نرجع نفعّل الضغط بس على الزر
            }}
          >
            <X size={14} />
          </button>
        </div>
        {hiddenInput}
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      style={{
        border: '2px dashed var(--border-default)', borderRadius: 12,
        padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
        background: 'var(--bg-muted)', transition: 'border-color 0.2s, background 0.2s',
        userSelect: 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
    >
      <ImageIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-hint)' }}>
        PNG · JPG · WEBP — الحد الأقصى 5MB
      </p>
      {hiddenInput}
    </div>
  )
}