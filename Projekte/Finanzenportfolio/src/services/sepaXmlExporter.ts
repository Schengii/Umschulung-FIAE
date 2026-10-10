export interface SepaTransferRecord {
  recipientName: string;
  iban: string;
  bic?: string;
  amountEur: number;
  purpose: string;
  executionDate: string; // YYYY-MM-DD
}

export interface SepaXmlOptions {
  initiatorName: string;
  initiatorIban: string;
  initiatorBic?: string;
  transfers: SepaTransferRecord[];
  batchBooking?: boolean;
}

/**
 * Sanitizes strings for strict XML / SEPA conformance.
 * Replaces XML special characters with entities, replaces German umlauts,
 * and strips unsupported characters.
 */
function cleanXmlString(str: string): string {
  const umlautsReplaced = str
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');

  // Strip invalid characters before XML escaping
  const stripped = umlautsReplaced.replace(/[^\w\s\-\.\,\+\(\)\/\:\&\<\>\"\']/gi, '');

  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .trim();
}

/**
 * Generates an ISO 20022 pain.001.001.03 compliant XML string
 * for SEPA credit transfers and standing orders (Daueraufträge / Sparpläne).
 */
export function generateSepaCreditTransferXml(options: SepaXmlOptions): string {
  const {
    initiatorName,
    initiatorIban,
    initiatorBic = 'GENODED1XXX',
    transfers,
    batchBooking = true
  } = options;

  const validTransfers = transfers.filter(t => t.amountEur > 0);
  const now = new Date();
  const creationDateTime = now.toISOString().split('.')[0];
  const msgId = `FP-SEPA-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getTime()}`;
  const pmtInfId = `PMT-${msgId}`;
  
  const totalAmount = validTransfers.reduce((sum, t) => sum + t.amountEur, 0);
  const numTransactions = validTransfers.length;

  const execDate = validTransfers.length > 0 && validTransfers[0].executionDate
    ? validTransfers[0].executionDate
    : now.toISOString().slice(0, 10);

  const transferEntriesXml = validTransfers.map((t, index) => {
    const endToEndId = `E2E-${msgId}-${index + 1}`;
    const cleanRecipient = cleanXmlString(t.recipientName || 'Broker Depot Service');
    const cleanPurpose = cleanXmlString(t.purpose || 'Sparplan Ausfuehrung');
    const cleanIban = t.iban.replace(/\s+/g, '').toUpperCase();
    const bicXml = t.bic ? `<CdtrAgt><FinInstnId><BIC>${cleanXmlString(t.bic)}</BIC></FinInstnId></CdtrAgt>` : '<CdtrAgt><FinInstnId><Othr><Id>NOTPROVIDED</Id></Othr></FinInstnId></CdtrAgt>';

    return `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${endToEndId}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${t.amountEur.toFixed(2)}</InstdAmt>
        </Amt>
        ${bicXml}
        <Cdtr>
          <Nm>${cleanRecipient}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${cleanIban}</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${cleanPurpose}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
  }).join('\n');

  const cleanInitName = cleanXmlString(initiatorName);
  const cleanInitIban = initiatorIban.replace(/\s+/g, '').toUpperCase();
  const cleanInitBic = cleanXmlString(initiatorBic);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDateTime}</CreDtTm>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${cleanInitName}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${pmtInfId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>${batchBooking ? 'true' : 'false'}</BtchBookg>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${execDate}</ReqdExctnDt>
      <Dbtr>
        <Nm>${cleanInitName}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${cleanInitIban}</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BIC>${cleanInitBic}</BIC>
        </FinInstnId>
      </DbtrAgt>
      <ChrgBr>SLEV</ChrgBr>
${transferEntriesXml}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

/**
 * Triggers a browser download of the generated SEPA XML file.
 */
export function downloadSepaXmlFile(options: {
  initiatorName: string;
  debtorName?: string;
  debtorIban: string;
  debtorBic?: string;
  orders: Array<{ recipientName: string; recipientIban: string; recipientBic?: string; amount: number; purpose?: string }>;
}, filename: string = 'sepa_standing_orders.xml'): void {
  const xmlContent = generateSepaCreditTransferXml({
    initiatorName: options.debtorName || options.initiatorName,
    initiatorIban: options.debtorIban,
    initiatorBic: options.debtorBic,
    transfers: options.orders.map(o => ({
      recipientName: o.recipientName,
      iban: o.recipientIban,
      bic: o.recipientBic,
      amountEur: o.amount,
      purpose: o.purpose || 'Finanzenportfolio Sparplan',
      executionDate: new Date().toISOString().slice(0, 10)
    }))
  });

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
