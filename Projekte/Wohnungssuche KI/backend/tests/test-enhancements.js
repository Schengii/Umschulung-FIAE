import { encryptText, decryptText, encryptBuffer, decryptBuffer } from '../crypto-util.js';
import { generatePortfolioBuffer } from '../pdf-generator.js';

async function runTests() {
  console.log('=== STARTE TEST FAHRT FÜR SYSTEM-ERWEITERUNGEN ===\n');

  // 1. Crypto Test
  console.log('[Test 1] Teste AES-256-GCM Verschlüsselung...');
  const secretText = 'Gehaltsschein Nettoeinkommen: 3500 Euro';
  const encrypted = encryptText(secretText);
  const decrypted = decryptText(encrypted);
  
  if (decrypted === secretText) {
    console.log('✅ Crypto Text-Verschlüsselung & Entschlüsselung ERFOLGREICH!');
  } else {
    console.error('❌ Crypto Text-Test FEHLGESCHLAGEN:', { encrypted, decrypted });
  }

  const rawBuffer = Buffer.from('PDF-Testdaten SCHUFA Auskunft', 'utf-8');
  const encBuffer = encryptBuffer(rawBuffer);
  const decBuffer = decryptBuffer(encBuffer);

  if (decBuffer.toString('utf-8') === rawBuffer.toString('utf-8')) {
    console.log('✅ Crypto Buffer-Verschlüsselung & Entschlüsselung ERFOLGREICH!');
  } else {
    console.error('❌ Crypto Buffer-Test FEHLGESCHLAGEN:', { dec: decBuffer.toString('utf-8'), raw: rawBuffer.toString('utf-8') });
  }

  // 2. PDF Portfolio & Wasserzeichen Test
  console.log('\n[Test 2] Teste PDF-Generator & Wasserzeichen...');
  try {
    const pdfBytes = await generatePortfolioBuffer('Test Bewerbungsmappe', [], 'Nur zur Bewerbung Musterstraße 12');
    if (pdfBytes && pdfBytes.length > 500) {
      console.log(`✅ PDF-Bewerbungsmappe mit Wasserzeichen ERFOLGREICH generiert (${pdfBytes.length} Bytes)!`);
    } else {
      console.error('❌ PDF-Generierung lieferte zu kleine Datei.');
    }
  } catch (err) {
    console.error('❌ Fehler bei PDF-Generierung:', err.message);
  }

  console.log('\n=== ALLE TESTS ABGESCHLOSSEN ===');
}

runTests();
