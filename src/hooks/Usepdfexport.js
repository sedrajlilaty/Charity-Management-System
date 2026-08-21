/**
 * usePDFReport — hook لتوليد تقارير PDF قابلة للتنزيل
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
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF
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
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, W, 20, 'F')
  doc.setFillColor(...C.gold)
  doc.rect(0, 20, W, 2.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.white)
  doc.text('Charity Management System', W / 2, 12, { align: 'center' })
  doc.setFillColor(...C.light)
  doc.rect(0, 22.5, W, 12, 'F')
  doc.setTextColor(...C.primary)
  doc.setFontSize(10)
  doc.text(title, W / 2, 30.5, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(...C.muted)
  doc.text(new Date().toLocaleDateString('en-US'), 10, 30.5)
  return 38
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

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePDFReport() {
  const { i18n } = useTranslation()
  const isAr = i18n.language?.startsWith('ar')
  const [isExporting, setIsExporting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewName, setPreviewName] = useState('report.pdf')

  const CAT_LABELS = {
    patient: isAr ? 'مريض' : 'Patient',
    orphan: isAr ? 'يتيم' : 'Orphan',
    school_student: isAr ? 'طالب مدرسة' : 'School Student',
    university_student: isAr ? 'طالب جامعة' : 'University Student',
  }

  const previewDoc = useCallback((doc, name) => {
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    setPreviewName(name)
  }, [])

  const confirmDownload = useCallback(() => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = previewName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [previewUrl, previewName])

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }, [previewUrl])

  // ── التبرعات (تصدير الجدول المعروض حالياً) ────────────────────────────────
  const exportDonations = useCallback(async (rows = []) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const y0 = header(doc, isAr ? 'تقرير التبرعات' : 'Donations Report')
      const total = rows.reduce((s, d) => s + (Number(d.amount_usd) || 0), 0)
      const campaign = rows.filter(d => d.target_type === 'campaign').length
      const request = rows.filter(d => d.target_type === 'request').length

      const y1 = statsRow(doc, [
        { label: isAr ? 'إجمالي التبرعات' : 'Total', value: rows.length, fill: C.light },
        { label: isAr ? 'حملات' : 'Campaigns', value: campaign, fill: C.green },
        { label: isAr ? 'طلبات' : 'Requests', value: request, fill: C.yellow },
        { label: isAr ? 'المبلغ الكلي (USD)' : 'Total Amount (USD)', value: `$${total.toLocaleString()}`, fill: C.light },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'المتبرع' : 'Donor',
          isAr ? 'المبلغ' : 'Amount',
          isAr ? 'النوع' : 'Type',
          isAr ? 'الجهة' : 'Target',
          isAr ? 'التاريخ' : 'Date',
        ]],
        body: rows.map((d, i) => {
          const hasOriginal = d.original_currency && d.original_currency !== 'USD'
          const amountStr = hasOriginal
            ? `${Number(d.original_amount).toLocaleString()} ${d.original_currency}`
            : `$${(Number(d.amount_usd) || 0).toLocaleString()}`
          return [
            i + 1,
            d.donor_anonymous ? (isAr ? 'مجهول' : 'Anonymous') : (d.donor_name ?? '—'),
            amountStr,
            d.target_type === 'campaign' ? (isAr ? 'حملة' : 'Campaign') : (isAr ? 'طلب' : 'Request'),
            d.target_name ?? '—',
            d.donated_at ? new Date(d.donated_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '—',
          ]
        }),
      })
      footer(doc)
      previewDoc(doc, `donations-${Date.now()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  // ── المستفيدون (تصدير الجدول المعروض حالياً) ──────────────────────────────
  const exportBeneficiaries = useCallback(async (rows = []) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const y0 = header(doc, isAr ? 'تقرير المستفيدين' : 'Beneficiaries Report')

      const accepted = rows.filter(b => b.status === 'accepted').length
      const pending = rows.filter(b => b.status === 'pending').length
      const totalSup = rows.reduce((s, b) => s + (b.required_amount ?? 0), 0)

      const y1 = statsRow(doc, [
        { label: isAr ? 'الإجمالي' : 'Total', value: rows.length, fill: C.light },
        { label: isAr ? 'نشطة' : 'Active', value: accepted, fill: C.green },
        { label: isAr ? 'انتظار' : 'Pending', value: pending, fill: C.yellow },
        { label: isAr ? 'إجمالي المبالغ' : 'Total Amount', value: `${totalSup.toLocaleString()} ${isAr ? 'USD' : 'SAR'}`, fill: C.blue },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'الاسم' : 'Name',
          isAr ? 'الهاتف' : 'Phone',
          isAr ? 'الفئة' : 'Category',
          isAr ? 'المحافظة' : 'Governorate',
          isAr ? 'المبلغ المطلوب' : 'Required Amount',
          isAr ? 'الحالة' : 'Status',
        ]],
        body: rows.map((b, i) => [
          i + 1,
          b.full_name ?? '—',
          b.phone ?? '—',
          CAT_LABELS[b.category] ?? b.category ?? '—',
          [b.governorate, b.region].filter(Boolean).join(' - ') || '—',
          b.required_amount > 0 ? `${b.required_amount.toLocaleString()} ${isAr ? 'USD' : 'SAR'}` : '—',
          b.status ?? '—',
        ]),
      })
      footer(doc)
      previewDoc(doc, `beneficiaries-${Date.now()}.pdf`)
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
      previewDoc(doc, `volunteers-${Date.now()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  // ── تقرير المستفيدين الشهري (من endpoint التقارير) ────────────────────────
  const exportMonthlyBeneficiariesReport = useCallback(async (reportData) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const y0 = header(doc, isAr
        ? `تقرير المستفيدين الشهري — ${reportData.period}`
        : `Monthly Beneficiaries Report — ${reportData.period}`)

      const y1 = statsRow(doc, [
        { label: isAr ? 'عدد المستفيدين' : 'Beneficiaries', value: reportData.beneficiaries_count, fill: C.light },
        { label: isAr ? 'إجمالي المبلغ (USD)' : 'Total Amount (USD)', value: `$${Number(reportData.total_amount_usd).toLocaleString()}`, fill: C.green },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'المستفيد' : 'Beneficiary',
          isAr ? 'الفئة' : 'Category',
          isAr ? 'عدد الطلبات' : 'Requests',
          isAr ? 'عدد التبرعات' : 'Donations',
          isAr ? 'إجمالي المبلغ' : 'Total Amount',
        ]],
        body: reportData.data.map((row, i) => [
          i + 1,
          row.beneficiary?.full_name ?? row.beneficiary?.name ?? '—',
          CAT_LABELS[row.beneficiary?.category] ?? row.beneficiary?.category ?? '—',
          row.requests_count,
          row.donations_count,
          `$${Number(row.total_amount_usd).toLocaleString()}`,
        ]),
      })

      footer(doc)
      previewDoc(doc, `beneficiaries-report-${reportData.period.replace('/', '-')}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  // ── تقرير التبرعات الشهري (من endpoint التقارير) ──────────────────────────
  const exportMonthlyDonationsReport = useCallback(async (reportData) => {
    setIsExporting(true)
    try {
      const JsPDF = await getJsPDF()
      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const y0 = header(doc, isAr
        ? `تقرير التبرعات الشهري — ${reportData.period}`
        : `Monthly Donations Report — ${reportData.period}`)

      const y1 = statsRow(doc, [
        { label: isAr ? 'عدد التبرعات' : 'Donations', value: reportData.donations_count, fill: C.light },
        { label: isAr ? 'إجمالي المبلغ (USD)' : 'Total Amount (USD)', value: `$${Number(reportData.total_amount_usd).toLocaleString()}`, fill: C.green },
      ], y0)

      table(doc, {
        startY: y1,
        head: [['#',
          isAr ? 'المتبرع' : 'Donor',
          isAr ? 'المبلغ' : 'Amount',
          isAr ? 'الجهة' : 'Target',
          isAr ? 'المستفيد' : 'Beneficiary',
          isAr ? 'التاريخ' : 'Date',
        ]],
        body: reportData.data.map((d, i) => {
          const hasOriginal = d.original_currency && d.original_currency !== 'USD'
          const amountStr = hasOriginal
            ? `${Number(d.original_amount).toLocaleString()} ${d.original_currency}`
            : `$${(Number(d.amount_usd) || 0).toLocaleString()}`

          // donor هو object فيه بيانات اليوزر (backendUser شكل)، مش donor_name جاهز
          const donorName = (
            d.donor?.name
            ?? `${d.donor?.first_name ?? ''} ${d.donor?.last_name ?? ''}`.trim()
          ) || (isAr ? 'مجهول' : 'Anonymous')
          const targetLabel = d.donationable_type === 'Campaign'
            ? (isAr ? 'حملة' : 'Campaign')
            : (isAr ? 'طلب' : 'Request')

          const beneficiaryName = d.beneficiary?.full_name ?? d.beneficiary?.name ?? '—'

          return [
            i + 1,
            donorName,
            amountStr,
            targetLabel,
            beneficiaryName,
            d.date ? new Date(d.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '—',
          ]
        }),
      })

      footer(doc)
      previewDoc(doc, `donations-report-${reportData.period.replace('/', '-')}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }, [isAr])

  return {
    exportDonations,
    exportBeneficiaries,
    exportVolunteers,
    exportMonthlyBeneficiariesReport,
    exportMonthlyDonationsReport,
    isExporting,
    previewUrl,
    closePreview,
    confirmDownload,
    previewDoc,
  }
}