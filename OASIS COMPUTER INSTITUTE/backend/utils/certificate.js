const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'certificate-template.pdf');
const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

// Coordinates below were measured directly against the institute's own
// certificate template (LESSON_CERTIFICATE.pdf, A4: 595.32 x 841.92 pt).
// If the template design ever changes, these will need re-measuring.
const COURSE_ROW_Y = {
  msword: 393.43,
  mspowerpoint: 369.31,
  msexcel: 345.13,
  internet: 317.47,
  sysarch: 289.81
};
const SCORE_COLUMN_X = 450.2;

async function generateCertificatePdf(student, average, remarkLabel) {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.getPages()[0];
  const black = rgb(0.05, 0.05, 0.05);

  const nameFont = await pdfDoc.embedFont(fs.readFileSync(path.join(FONTS_DIR, 'LCALLIG.TTF')));
  const scoreFont = await pdfDoc.embedFont(fs.readFileSync(path.join(FONTS_DIR, 'comicbd.ttf')));
  const dateFont = await pdfDoc.embedFont(fs.readFileSync(path.join(FONTS_DIR, 'GOTHICB.TTF')));
  const bigFont = await pdfDoc.embedFont(fs.readFileSync(path.join(FONTS_DIR, 'BROADW.TTF')));

  // Student ID number (the "OCI-26-" part is already printed - we just add the number).
  // Kept close to the printed prefix rather than centered in the whole blank.
  const idNumber = student.lessonNumber.split('-').pop();
  page.drawText(idNumber, { x: 182, y: 841.92 - 168.6, size: 11, font: scoreFont, color: black });

  // Date
  const dateStr = (student.completionDate ? new Date(student.completionDate) : new Date())
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  page.drawText(dateStr, { x: 430, y: 841.92 - 168.6, size: 12, font: dateFont, color: black });

  // Full name (centered on the blank line, auto-shrinks to fit if the name is long)
  let nameSize = 25;
  const maxNameWidth = 340;
  let nameWidth = nameFont.widthOfTextAtSize(student.fullName, nameSize);
  while (nameWidth > maxNameWidth && nameSize > 14) {
    nameSize -= 1;
    nameWidth = nameFont.widthOfTextAtSize(student.fullName, nameSize);
  }
  page.drawText(student.fullName, {
    x: 371.6 - nameWidth / 2,
    y: 841.92 - 252,
    size: nameSize,
    font: nameFont,
    color: black
  });

  // Scores
  Object.keys(COURSE_ROW_Y).forEach((key) => {
    const val = student.scores[key];
    const text = val === null || val === undefined ? '-' : String(val);
    const w = scoreFont.widthOfTextAtSize(text, 11);
    page.drawText(text, {
      x: SCORE_COLUMN_X - w / 2,
      y: COURSE_ROW_Y[key],
      size: 11,
      font: scoreFont,
      color: black
    });
  });

  // Average
  const avgText = average === null ? '-' : String(average);
  page.drawText(avgText, { x: 345, y: 253, size: 18, font: bigFont, color: black });

  // Award / grade
  page.drawText(remarkLabel, { x: 205, y: 841.92 - 631.8 - 7, size: 18, font: bigFont, color: black });

  return pdfDoc.save();
}

module.exports = { generateCertificatePdf };
