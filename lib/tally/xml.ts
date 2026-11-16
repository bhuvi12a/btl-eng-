/**
 * TallyPrime XML Envelope Generator and Response Parser.
 * Generates standards-compliant Tally XML payloads for Master Imports & Exports.
 */

export interface TallyCompanyInfo {
    id: string;
    name: string;
    isCurrent: boolean;
}

export interface TallyCustomerExportData {
    companyName: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    gstNumber?: string | null;
    panNumber?: string | null;
    address?: string | null;
    state?: string | null;
    pinCode?: string | null;
    creditLimit?: string | null;
}

export interface TallySupplierExportData {
    companyName: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    gstNumber?: string | null;
    panNumber?: string | null;
    address?: string | null;
    state?: string | null;
    pinCode?: string | null;
}

export interface TallyProductExportData {
    partNumber: string;
    name: string;
    uom: string;
    category?: string | null;
    standardCost?: string | null;
    sellingPrice?: string | null;
    hsnCode?: string | null;
}

/**
 * Escapes XML special characters for safe inclusion in Tally payloads.
 */
export function escapeXml(unsafe: string | null | undefined): string {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Generates Tally TDL XML request to list open companies in the running Tally instance.
 */
export function buildGetCompaniesXml(): string {
    return `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>List of Companies</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <REPORT NAME="List of Companies">
            <FORMS>List of Companies</FORMS>
          </REPORT>
          <FORM NAME="List of Companies">
            <PARTS>List of Companies</PARTS>
          </FORM>
          <PART NAME="List of Companies">
            <LINES>Company Line</LINES>
            <REPEAT>Company Line : Company</REPEAT>
            <SCROLLED>Vertical</SCROLLED>
          </PART>
          <LINE NAME="Company Line">
            <FIELDS>FldName, FldNumber</FIELDS>
          </LINE>
          <FIELD NAME="FldName">
            <SET>$Name</SET>
          </FIELD>
          <FIELD NAME="FldNumber">
            <SET>$CompanyNumber</SET>
          </FIELD>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();
}

/**
 * Builds XML to import Customers as Sundry Debtors in Tally.
 */
export function buildCustomerImportXml(companyName: string, customers: TallyCustomerExportData[]): string {
    const ledgersXml = customers
        .map(
            (c) => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(c.companyName)}" ACTION="Create">
            <NAME.LIST>
              <NAME>${escapeXml(c.companyName)}</NAME>
            </NAME.LIST>
            <PARENT>Sundry Debtors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <COUNTRYNAME>India</COUNTRYNAME>
            <LEDSTATENAME>${escapeXml(c.state || 'Tamil Nadu')}</LEDSTATENAME>
            <PINCODE>${escapeXml(c.pinCode || '')}</PINCODE>
            ${c.gstNumber ? `<PARTYGSTIN>${escapeXml(c.gstNumber)}</PARTYGSTIN>` : ''}
            ${c.panNumber ? `<INCOMETAXNUMBER>${escapeXml(c.panNumber)}</INCOMETAXNUMBER>` : ''}
            ${c.address ? `<ADDRESS.LIST><ADDRESS>${escapeXml(c.address)}</ADDRESS></ADDRESS.LIST>` : ''}
            ${c.creditLimit ? `<CREDITLIMIT>${escapeXml(c.creditLimit)}</CREDITLIMIT>` : ''}
          </LEDGER>
        </TALLYMESSAGE>`
        )
        .join('');

    return `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${ledgersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`.trim();
}

/**
 * Builds XML to import Suppliers as Sundry Creditors in Tally.
 */
export function buildSupplierImportXml(companyName: string, suppliers: TallySupplierExportData[]): string {
    const ledgersXml = suppliers
        .map(
            (s) => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(s.companyName)}" ACTION="Create">
            <NAME.LIST>
              <NAME>${escapeXml(s.companyName)}</NAME>
            </NAME.LIST>
            <PARENT>Sundry Creditors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <COUNTRYNAME>India</COUNTRYNAME>
            <LEDSTATENAME>${escapeXml(s.state || 'Tamil Nadu')}</LEDSTATENAME>
            <PINCODE>${escapeXml(s.pinCode || '')}</PINCODE>
            ${s.gstNumber ? `<PARTYGSTIN>${escapeXml(s.gstNumber)}</PARTYGSTIN>` : ''}
            ${s.panNumber ? `<INCOMETAXNUMBER>${escapeXml(s.panNumber)}</INCOMETAXNUMBER>` : ''}
            ${s.address ? `<ADDRESS.LIST><ADDRESS>${escapeXml(s.address)}</ADDRESS></ADDRESS.LIST>` : ''}
          </LEDGER>
        </TALLYMESSAGE>`
        )
        .join('');

    return `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${ledgersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`.trim();
}

/**
 * Builds XML to import Products as Stock Items in Tally.
 */
export function buildProductImportXml(companyName: string, products: TallyProductExportData[]): string {
    const itemsXml = products
        .map(
            (p) => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <STOCKITEM NAME="${escapeXml(p.partNumber)} - ${escapeXml(p.name)}" ACTION="Create">
            <NAME.LIST>
              <NAME>${escapeXml(p.partNumber)} - ${escapeXml(p.name)}</NAME>
            </NAME.LIST>
            <BASEUNITS>${escapeXml(p.uom || 'PCS')}</BASEUNITS>
            ${p.category ? `<PARENT>${escapeXml(p.category)}</PARENT>` : ''}
            ${p.hsnCode ? `<HSNCODE>${escapeXml(p.hsnCode)}</HSNCODE>` : ''}
          </STOCKITEM>
        </TALLYMESSAGE>`
        )
        .join('');

    return `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${itemsXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`.trim();
}

/**
 * Parses response from Tally XML import.
 * Detects <CREATED>, <ALTERED>, <ERRORS>, <LINEERROR>.
 */
export function parseTallyImportResponse(xmlResponse: string): {
    success: boolean;
    createdCount: number;
    alteredCount: number;
    errorsCount: number;
    errorMessages: string[];
} {
    const createdMatch = xmlResponse.match(/<CREATED>(\d+)<\/CREATED>/i);
    const alteredMatch = xmlResponse.match(/<ALTERED>(\d+)<\/ALTERED>/i);
    const errorsMatch = xmlResponse.match(/<ERRORS>(\d+)<\/ERRORS>/i);

    const createdCount = createdMatch ? parseInt(createdMatch[1], 10) : 0;
    const alteredCount = alteredMatch ? parseInt(alteredMatch[1], 10) : 0;
    const errorsCount = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;

    const errorMessages: string[] = [];
    const lineErrors = xmlResponse.match(/<LINEERROR>(.*?)<\/LINEERROR>/gi);
    if (lineErrors) {
        lineErrors.forEach((err) => {
            const clean = err.replace(/<\/?LINEERROR>/gi, '').trim();
            if (clean) errorMessages.push(clean);
        });
    }

    return {
        success: errorsCount === 0 && (createdCount > 0 || alteredCount > 0),
        createdCount,
        alteredCount,
        errorsCount,
        errorMessages,
    };
}
