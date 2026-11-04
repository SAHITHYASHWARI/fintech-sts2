const Tesseract = require('tesseract.js');
const fs = require('fs');

async function testOcr() {
  const imgPath = 'C:/Users/HP/.gemini/antigravity/brain/d1fcb264-0d2c-4026-b49b-2360e53a64ad/.user_uploaded/media_1793601832884_d79bd9e7.jpg';
  console.log('Testing OCR on:', imgPath);
  const result = await Tesseract.recognize(imgPath, 'eng');
  console.log('--- RAW OCR TEXT ---');
  console.log(result.data.text);
}

testOcr().catch(console.error);
