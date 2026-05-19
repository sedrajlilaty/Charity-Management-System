/**
 * usePDFReport — hook لتوليد تقارير PDF قابلة للتنزيل
 *
 * يستخدم jsPDF + jspdf-autotable مباشرة من CDN عبر script tag
 * لتفادي مشاكل dynamic import في Vite/ESM.
 *
 * التثبيت:
 *   npm install jspdf jspdf-autotable
 *
 * OR أضف في index.html قبل </body>:
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  primary: [9, 64, 55],
  gold: [234, 179, 8],
  light: [230, 240, 238],
  white: [255, 255, 255],
  muted: [100, 116, 139],
  dark: [30, 41, 59],
  green: [220, 252, 231],
  yellow: [254, 249, 195],
  blue: [239, 246, 255],
  red: [254, 242, 242],
}

// ─── Loader — يدعم npm import و CDN على حد سواء ──────────────────────────────
async function getJsPDF() {
  // أولاً — هل jsPDF محمّل من CDN؟
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF

  // ثانياً — npm import
  try {
    const [{ default: JsPDF }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    return JsPDF
  } catch {
    throw new Error('jsPDF غير متاح. ثبّت: npm install jspdf jspdf-autotable')
  }
}

// ─── رسم الترويسة ────────────────────────────────────────────────────────────
function header(doc, title) {
  const W = doc.internal.pageSize.getWidth()

  // شريط أخضر
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, W, 20, 'F')

  // شريط ذهبي
  doc.setFillColor(...C.gold)
  doc.rect(0, 20, W, 2.5, 'F')

  // عنوان النظام
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.white)
  doc.text('Charity Management System', W / 2, 12, { align: 'center' })

  // عنوان التقرير
  doc.setFillColor(...C.light)
  doc.rect(0, 22.5, W, 12, 'F')
  doc.setTextColor(...C.primary)
  doc.setFontSize(10)
  doc.text(title, W / 2, 30.5, { align: 'center' })

  // تاريخ الطباعة
  doc.setFontSize(7)
  doc.setTextColor(...C.muted)
  doc.text(new Date().toLocaleDateString('en-US'), 10, 30.5)

  return 38  // Y بعد الترويسة
}

// ─── بطاقات الإحصائيات ────────────────────────────────────────────────────────
function statsRow(doc, cards, startY) {
  const W = doc.internal.pageSize.getWidth()
  const cW = (W - 20) / cards.length
  let x = 10

  cards.forEach(({ label, value, fill }) => {
    doc.setFillColor(...(fill ?? C.light))
    doc.roundedRect(x, startY, cW - 3, 13, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...C.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x + (cW - 3) / 2, startY + 4.5, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.dark)
    doc.text(String(value), x + (cW - 3) / 2, startY + 11, { align: 'center' })
    x += cW
  })

  return startY + 18
}

// ─── ذيل الصفحات ──────────────────────────────────────────────────────────────
function footer(doc) {
  const pages = doc.internal.getNumberOfPages()
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(...C.light)
    doc.rect(0, H - 10, W, 10, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...C.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${i} of ${pages}`, W / 2, H - 3.5, { align: 'center' })
  }
}

// ─── الجدول ────────────────────────────────────────────────────────────────────
function table(doc, { head, body, startY }) {
  doc.autoTable({
    startY,
    head,
    body,
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  })
}

// ─── تحميل الملف ──────────────────────────────────────────────────────────────
function saveDoc(doc, name) {
  // الطريقة الأموثق أمانًا للتنزيل
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePDFReport() {
  const { i18n } = useTranslation()
  const isAr = i18n.language?.startsWith('ar')
  const [isExporting, setIsExporting] = useState(false)

  // ── التبرعات ────────────────────────────────────────────────────────────────
  const exportDonations = useCallback(async (rows = []) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const y0 = header(doc, isAr ? 'تقرير التبرعات' : 'Donations Report')

      const total = rows.reduce((s, d) => s + (d.amount ?? 0), 0)
      const approved = rows.filter(d => d.status === 'approved').length
      const pending = rows.filter(d => d.status === 'pending').length

      const y1 = statsRow(doc, [
        { label: isAr ? 'إجمالي' : 'Total', value: rows.length, fill: C.light },
        { label: isAr ? 'مقبولة' : 'Approved', value: approved, fill: C.green },
        { label: isAr ? 'انتظار' : 'Pending', value: pending, fill: C.yellow },
        { label: isAr ? 'المبلغ الكلي' : 'Total Amount', value: `${total.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`, fill: C.light },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'المتبرع' : 'Donor',
          isAr ? 'المبلغ' : 'Amount',
          isAr ? 'النوع' : 'Type',
          isAr ? 'الحملة' : 'Campaign',
          isAr ? 'متكرر' : 'Recurring',
          isAr ? 'التاريخ' : 'Date',
          isAr ? 'الحالة' : 'Status',
        ]],
        body: rows.map((d, i) => [
          i + 1,
          d.donorName ?? '—',
          `${(d.amount ?? 0).toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`,
          d.type ?? '—',
          d.campaignName ?? '—',
          d.recurring ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No'),
          d.date ?? '—',
          d.status ?? '—',
        ]),
      })

      footer(doc)
      saveDoc(doc, `donations-${Date.now()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  // ── المستفيدون ──────────────────────────────────────────────────────────────
  const exportBeneficiaries = useCallback(async (rows = []) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const y0 = header(doc, isAr ? 'تقرير المستفيدين' : 'Beneficiaries Report')

      const active = rows.filter(b => b.status === 'active').length
      const pending = rows.filter(b => b.status === 'pending').length
      const totalSup = rows.reduce((s, b) => s + (b.monthlySupport ?? 0), 0)

      const y1 = statsRow(doc, [
        { label: isAr ? 'الإجمالي' : 'Total', value: rows.length, fill: C.light },
        { label: isAr ? 'نشطة' : 'Active', value: active, fill: C.green },
        { label: isAr ? 'انتظار' : 'Pending', value: pending, fill: C.yellow },
        { label: isAr ? 'الدعم الشهري' : 'Monthly Total', value: `${totalSup.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`, fill: C.blue },
      ], y0)

      const CAT = { orphan: isAr ? 'يتيم' : 'Orphan', educational: isAr ? 'تعليم' : 'Education', medical: isAr ? 'طبي' : 'Medical', widow: isAr ? 'أرملة' : 'Widow', poor: isAr ? 'محدود' : 'Low-income' }
      const PRI = { high: isAr ? 'عالية' : 'High', medium: isAr ? 'متوسطة' : 'Medium', low: isAr ? 'منخفضة' : 'Low' }

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'الاسم' : 'Name',
          isAr ? 'الهاتف' : 'Phone',
          isAr ? 'الفئة' : 'Category',
          isAr ? 'الأولوية' : 'Priority',
          isAr ? 'الدعم الشهري' : 'Monthly Support',
          isAr ? 'عدد الأفراد' : 'Members',
          isAr ? 'العنوان' : 'Address',
          isAr ? 'الحالة' : 'Status',
        ]],
        body: rows.map((b, i) => [
          i + 1,
          b.name ?? '—',
          b.phone ?? '—',
          CAT[b.category] ?? b.category ?? '—',
          PRI[b.priority] ?? b.priority ?? '—',
          b.monthlySupport > 0 ? `${b.monthlySupport.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}` : '—',
          b.membersCount ?? '—',
          b.address ?? '—',
          b.status ?? '—',
        ]),
      })

      footer(doc)
      saveDoc(doc, `beneficiaries-${Date.now()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  // ── المتطوعون ────────────────────────────────────────────────────────────────
  const exportVolunteers = useCallback(async (rows = []) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const y0 = header(doc, isAr ? 'تقرير طلبات التطوع' : 'Volunteers Report')

      const y1 = statsRow(doc, [
        { label: isAr ? 'الإجمالي' : 'Total', value: rows.length, fill: C.light },
        { label: isAr ? 'انتظار' : 'Pending', value: rows.filter(v => v.status === 'pending').length, fill: C.yellow },
        { label: isAr ? 'مقبولة' : 'Approved', value: rows.filter(v => v.status === 'approved').length, fill: C.green },
        { label: isAr ? 'مكتملة' : 'Completed', value: rows.filter(v => v.status === 'completed').length, fill: C.blue },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'المتطوع' : 'Volunteer',
          isAr ? 'الهاتف' : 'Phone',
          isAr ? 'الحملة' : 'Campaign',
          isAr ? 'التخصص' : 'Skill',
          isAr ? 'الإتاحة' : 'Availability',
          isAr ? 'الخبرة' : 'Experience',
          isAr ? 'تاريخ التقديم' : 'Applied At',
          isAr ? 'الحالة' : 'Status',
        ]],
        body: rows.map((v, i) => [
          i + 1,
          v.name ?? '—',
          v.phone ?? '—',
          v.campaignName ?? '—',
          v.skill ?? '—',
          v.availability ?? '—',
          v.experience ?? '—',
          v.appliedAt ?? '—',
          v.status ?? '—',
        ]),
      })

      footer(doc)
      saveDoc(doc, `volunteers-${Date.now()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  return { exportDonations, exportBeneficiaries, exportVolunteers, isExporting }
}