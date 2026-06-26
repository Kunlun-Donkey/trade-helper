import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.vfs;

interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  docNo: string;
  type: 'PI' | 'CI' | 'PL' | '合同';
  customerName: string;
  tradeTerms: string;
  paymentTerms: string;
  deliveryDate: string;
  currency: string;
  totalAmount: number;
  items: InvoiceItem[];
  createdAt: string;
}

const typeTitle: Record<string, string> = {
  PI: 'PROFORMA INVOICE',
  CI: 'COMMERCIAL INVOICE',
  PL: 'PACKING LIST',
  '合同': 'SALES CONTRACT',
};

const currencySymbol: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
};

function formatAmount(amount: number, currency: string): string {
  const symbol = currencySymbol[currency] || '';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoicePdf(invoice: InvoiceData): void {
  const sym = currencySymbol[invoice.currency] || '';

  const itemsTableBody: TableCell[][] = [
    [
      { text: 'No.', style: 'tableHeader' },
      { text: 'Description', style: 'tableHeader' },
      { text: 'Qty', style: 'tableHeader' },
      { text: 'Unit Price', style: 'tableHeader' },
      { text: 'Amount', style: 'tableHeader' },
    ],
    ...invoice.items.map((item, idx) => [
      { text: String(idx + 1), alignment: 'center' as const },
      { text: item.productName },
      { text: String(item.quantity), alignment: 'center' as const },
      { text: `${sym}${item.unitPrice.toFixed(2)}`, alignment: 'right' as const },
      { text: `${sym}${item.amount.toFixed(2)}`, alignment: 'right' as const },
    ]),
    [
      { text: 'TOTAL', colSpan: 4, alignment: 'right' as const, bold: true },
      {},
      {},
      {},
      { text: formatAmount(invoice.totalAmount, invoice.currency), alignment: 'right' as const, bold: true },
    ],
  ];

  const content: Content[] = [
    // Company Header
    {
      text: 'YOUR COMPANY NAME',
      style: 'companyName',
      alignment: 'center',
    },
    {
      text: 'Address Line 1, City, Country\nTel: +86-xxx-xxxx | Email: info@company.com',
      alignment: 'center',
      fontSize: 9,
      color: '#666666',
      margin: [0, 0, 0, 20],
    },
    // Separator
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#333333' }] },
    // Document Title
    {
      text: typeTitle[invoice.type] || invoice.type,
      style: 'docTitle',
      alignment: 'center',
      margin: [0, 15, 0, 15],
    },
    // Meta Info
    {
      columns: [
        {
          width: '50%',
          text: [
            { text: 'To: ', bold: true },
            invoice.customerName,
          ],
        },
        {
          width: '50%',
          alignment: 'right' as const,
          text: [
            { text: 'No: ', bold: true },
            `${invoice.docNo}\n`,
            { text: 'Date: ', bold: true },
            invoice.createdAt || new Date().toISOString().split('T')[0],
          ],
        },
      ],
      margin: [0, 0, 0, 15],
    },
    // Items Table
    {
      table: {
        headerRows: 1,
        widths: [30, '*', 60, 80, 90],
        body: itemsTableBody,
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: TableCell[][] } }) =>
          (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
        vLineWidth: () => 0.5,
        hLineColor: (i: number) => (i <= 1 ? '#333333' : '#cccccc'),
        vLineColor: () => '#cccccc',
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 20],
    },
    // Terms
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Trade Terms', bold: true, fontSize: 10, margin: [0, 0, 0, 4] },
            { text: invoice.tradeTerms || 'N/A', fontSize: 10 },
          ],
        },
        {
          width: '50%',
          stack: [
            { text: 'Payment Terms', bold: true, fontSize: 10, margin: [0, 0, 0, 4] },
            { text: invoice.paymentTerms || 'N/A', fontSize: 10 },
          ],
        },
      ],
      margin: [0, 0, 0, 10],
    },
    // Delivery Date
    invoice.deliveryDate
      ? {
          text: [
            { text: 'Delivery Date: ', bold: true },
            invoice.deliveryDate,
          ],
          fontSize: 10,
          margin: [0, 0, 0, 30] as [number, number, number, number],
        }
      : { text: '' },
    // Signature
    {
      columns: [
        {
          width: '50%',
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5 }] },
            { text: 'Seller Signature', fontSize: 9, margin: [0, 4, 0, 0] },
          ],
        },
        {
          width: '50%',
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5 }] },
            { text: 'Buyer Signature', fontSize: 9, margin: [0, 4, 0, 0] },
          ],
        },
      ],
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content,
    styles: {
      companyName: {
        fontSize: 18,
        bold: true,
        color: '#1a1a1a',
      },
      docTitle: {
        fontSize: 14,
        bold: true,
        color: '#333333',
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: '#f5f5f5',
        alignment: 'center',
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  pdfMake.createPdf(docDefinition).download(`${invoice.docNo || 'document'}.pdf`);
}
