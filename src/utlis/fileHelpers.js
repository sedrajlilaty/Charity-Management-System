// src/utils/fileHelpers.js
//
// ImageUpload بيرجع base64 data URL (مش File)، بس الباك اند
// بحتاج ملف حقيقي جوا FormData حتى $request->hasFile() تصير true.
// هاي الدالة بتحوّل الـ base64 → File، أو ترجّع القيمة متل ما هي
// إذا أصلاً مش base64 (يعني null أو File جاهز أصلاً).

export function dataURLtoFile(dataurl, filename = 'upload.png') {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.startsWith('data:')) {
        return dataurl // null أو File حقيقي أصلاً — رجعيه متل ما هو
    }

    const arr = dataurl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])

    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
}