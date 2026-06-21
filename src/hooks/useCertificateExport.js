import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * useCertificateExport
 * يوفر:
 *  - certRef: ref يتم وضعه على CertificateTemplate (مخفي خارج الشاشة)
 *  - generatePDF(fileName): يحول العنصر إلى PDF ويبدأ التحميل
 *  - isGenerating: حالة التحميل
 */
export function useCertificateExport() {
    const certRef = useRef(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const generatePDF = async (fileName = 'certificate.pdf') => {
        if (!certRef.current) return

        setIsGenerating(true)
        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 2, // جودة أعلى
                useCORS: true,
                backgroundColor: '#ffffff',
            })

            const imgData = canvas.toDataURL('image/png')

            // A4 Landscape بالميليمتر
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(fileName)

            return pdf.output('blob') // يمكن استخدامه لاحقاً لرفعه أو إرساله
        } finally {
            setIsGenerating(false)
        }
    }

    return { certRef, generatePDF, isGenerating }
}