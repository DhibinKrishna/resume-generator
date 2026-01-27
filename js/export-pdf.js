// PDF export using html2pdf.js

export async function downloadPDF(element, filename = 'resume.pdf') {
  if (typeof html2pdf === 'undefined') {
    alert('PDF library not loaded. Please check your internet connection and refresh.');
    return;
  }

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  // Build the PDF via jsPDF so we can strip trailing blank pages
  const worker = html2pdf().set(opt).from(element);
  const pdf = await worker.toPdf().get('pdf');

  const pageCount = pdf.internal.getNumberOfPages();
  // Walk backwards removing any fully blank trailing pages
  for (let i = pageCount; i >= 2; i--) {
    pdf.setPage(i);
    // Grab pixel data for this page to detect emptiness
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Check if any content objects were drawn on this page.
    // html2pdf renders each page as a single image slice.  A blank page
    // will have no image (the canvas was already fully consumed).
    // Internal pages store content in the page's content stream.
    const pageInfo = pdf.internal.pages[i];
    // pages[i] is an array of drawing instructions; a blank page
    // only contains the default empty array or a trivially short stream.
    const content = Array.isArray(pageInfo) ? pageInfo.join('') : '';
    const isBlank = content.replace(/\s/g, '').length < 20;
    if (isBlank) {
      pdf.deletePage(i);
    } else {
      break; // stop at the first non-blank page from the end
    }
  }

  pdf.save(filename);
}
