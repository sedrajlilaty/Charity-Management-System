import { forwardRef } from 'react'

/**
 * قالب الشهادة - يتم تحويله إلى PDF عبر html2canvas + jsPDF
 * يُستخدم بـ ref عشان نقدر نلتقط صورته
 *
 * الأبعاد: A4 Landscape => 1122 x 793 px (تقريباً) بدقة 96dpi
 */
const CertificateTemplate = forwardRef(({ volunteerName, hours, issueDate, certificateId }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '1122px',
        height: '793px',
        position: 'relative',
        background: '#ffffff',
        fontFamily: 'Cairo, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* إطار خارجي بالألوان الأساسية */}
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          border: '3px solid #094037',
          borderRadius: '12px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '40px',
          border: '1px solid #eab308',
          borderRadius: '8px',
        }}
      />

      {/* محتوى الشهادة */}
      <div
        style={{
          position: 'absolute',
          inset: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px',
          gap: '18px',
        }}
      >
        {/* شعار / اسم الجمعية */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#094037',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#eab308',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            عطاء
          </div>
          <div style={{ fontSize: '14px', color: '#094037', fontWeight: 600, letterSpacing: '1px' }}>
            جمعية عطاء الخيرية
          </div>
        </div>

        {/* عنوان الشهادة */}
        <div style={{ fontSize: '40px', fontWeight: 800, color: '#094037', marginTop: '10px' }}>
          شهادة تقدير وشكر
        </div>

        <div style={{ fontSize: '18px', color: '#6b7280', maxWidth: '700px', lineHeight: 1.8 }}>
          تتقدم جمعية عطاء الخيرية بخالص الشكر والتقدير إلى المتطوع
        </div>

        {/* اسم المتطوع */}
        <div
          style={{
            fontSize: '34px',
            fontWeight: 800,
            color: '#111827',
            padding: '6px 40px',
            borderBottom: '3px solid #eab308',
          }}
        >
          {volunteerName}
        </div>

        <div style={{ fontSize: '18px', color: '#6b7280', maxWidth: '700px', lineHeight: 1.8 }}>
          لما قدّمه من جهد وعطاء، حيث أتم
          <span style={{ color: '#094037', fontWeight: 800, padding: '0 6px' }}>{hours}</span>
          ساعة تطوعية، وذلك تقديراً لمساهمته الفعالة في خدمة المجتمع
        </div>

        {/* تذييل: التاريخ ورقم الشهادة */}
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '90px',
            right: '90px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '14px',
            color: '#374151',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>التاريخ</div>
            <div>{issueDate}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '130px',
                borderTop: '2px solid #094037',
                paddingTop: '8px',
                fontWeight: 700,
                color: '#094037',
              }}
            >
              التوقيع والختم
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>رقم الشهادة</div>
            <div>{certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  )
})

CertificateTemplate.displayName = 'CertificateTemplate'

export default CertificateTemplate