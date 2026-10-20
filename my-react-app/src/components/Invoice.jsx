import React from 'react';
import './Invoice.css';

export function generateInvoicePDF(order, payment, user) {
    const doc = new InvoiceDocument(order, payment, user);
    return doc.generate();
}

export function downloadInvoicePDF(order, payment, user) {
    const pdfContent = generateInvoicePDF(order, payment, user);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Anywhere-Invoice-${order.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

class InvoiceDocument {
    constructor(order, payment, user) {
        this.order = order;
        this.payment = payment;
        this.user = user;
        this.pageWidth = 595;
        this.pageHeight = 842;
        this.margin = 40;
        this.currentY = this.margin;
        this.lineHeight = 16;
        this.content = [];
        this.xOffsets = [0];
    }

    addText(text, fontSize = 12, bold = false, color = '000000') {
        const fontName = bold ? '/F2' : '/F1';
        this.content.push(`${fontName} ${fontSize} Tf`);
        this.content.push(`0.${color} rg`);
        this.content.push(`${this.margin} ${this.pageHeight - this.currentY} Td`);
        this.content.push(`(${this.escapePdfText(text)}) Tj`);
        this.currentY += this.lineHeight + (fontSize > 12 ? 6 : 0);
    }

    addLine() {
        this.content.push('q');
        this.content.push('0.8 0.8 0.8 rg');
        this.content.push(`${this.margin} ${this.pageHeight - this.currentY} m`);
        this.content.push(`${this.pageWidth - this.margin} ${this.pageHeight - this.currentY} l`);
        this.content.push('S');
        this.content.push('Q');
        this.currentY += 8;
    }

    addSpacing(height = 1) {
        this.currentY += height * this.lineHeight;
    }

    escapePdfText(text) {
        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }

    generate() {
        this.content.push('BT');
        
        // Header - Company Name
        this.addText('ANYWHERE', 24, true, '0066cc');
        this.addSpacing(0.5);
        this.addText('Premium Delivery Services', 10, false, '666666');
        this.addLine();
        this.addSpacing(0.5);
        
        // Invoice Title and Number
        this.addText(`INVOICE #${String(this.order.id).padStart(6, '0')}`, 16, true, '333333');
        this.addSpacing(0.3);
        this.addText(`Date: ${this.formatDate(this.order.orderedAt)}`, 10, false, '666666');
        this.addSpacing(1);
        
        // Bill To Section
        this.addText('BILL TO:', 11, true, '333333');
        this.addText(this.user?.fullName || this.user?.name || 'Customer', 10);
        this.addText(this.user?.phone || '-', 10);
        this.addText(this.user?.email || '-', 10);
        this.addSpacing(0.5);
        
        // Delivery Address
        this.addText('DELIVERY ADDRESS:', 11, true, '333333');
        this.addText(this.order.deliveryAddress || 'Not specified', 10);
        this.addLine();
        this.addSpacing(0.5);
        
        // Items Table Header
        this.addText('Items Ordered', 11, true, '333333');
        this.addSpacing(0.3);
        
        // Items
        if (this.order.items && this.order.items.length > 0) {
            this.order.items.forEach((item) => {
                const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
                this.addText(
                    `${item.quantity} x ${item.productName} - Rs.${itemTotal}`,
                    10
                );
            });
        } else {
            this.addText('No items in order', 10);
        }
        
        this.addLine();
        this.addSpacing(0.5);
        
        // Summary Section
        this.addText(`Subtotal: Rs.${this.order.items
            ?.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
            .toFixed(2) || '0.00'}`, 11, true);
        
        this.addSpacing(0.3);
        this.addText(`Total Amount: Rs.${Number(this.order.totalAmount).toFixed(2)}`, 12, true, '0066cc');
        this.addSpacing(1);
        
        // Payment Section
        this.addText('PAYMENT DETAILS', 11, true, '333333');
        this.addText(`Method: ${this.payment?.paymentMethod || this.order.paymentMethod || 'Not specified'}`, 10);
        this.addText(`Status: ${this.payment?.paymentStatus || 'Pending'}`, 10);
        this.addText(`Transaction ID: ${this.payment?.transactionId || 'N/A'}`, 10);
        this.addText(`Payment Date: ${this.formatDate(this.payment?.paymentTime || this.order.orderedAt)}`, 10);
        this.addSpacing(1);
        
        // Order Info
        this.addText('ORDER INFORMATION', 11, true, '333333');
        this.addText(`Order ID: ORD-${String(this.order.id).padStart(6, '0')}`, 10);
        this.addText(`Service Type: ${this.order.items?.[0]?.serviceType || 'General'}`, 10);
        this.addText(`Status: ${this.order.status || 'Confirmed'}`, 10);
        this.addSpacing(1);
        
        // Footer
        this.addLine();
        this.addSpacing(0.5);
        this.addText('Thank you for choosing Anywhere!', 10, false, '0066cc');
        this.addText('For support, contact support@anywhere.local', 9, false, '999999');
        this.addSpacing(0.3);
        this.addText('© 2026 Anywhere Delivery Services. All rights reserved.', 8, false, 'aaaaaa');
        
        this.content.push('ET');
        
        return this.buildPDF();
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    buildPDF() {
        const streamContent = this.content.join('\n');
        const objects = [];
        
        // Catalog
        objects.push('<< /Type /Catalog /Pages 2 0 R >>');
        
        // Pages
        objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
        
        // Page
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pageWidth} ${this.pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`);
        
        // Font 1
        objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
        
        // Font 2 (Bold)
        objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
        
        // Content
        objects.push(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`);
        
        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        
        objects.forEach((obj, idx) => {
            offsets.push(pdf.length);
            pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
        });
        
        const xrefOffset = pdf.length;
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach((offset) => {
            pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
        });
        
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
        
        return pdf;
    }
}

// Invoice Preview Component (for UI display)
export function InvoicePreview({ order, payment, user, onClose }) {
    return (
        <div className="invoice-modal-overlay" onClick={onClose}>
            <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
                <button className="invoice-close-btn" onClick={onClose}>×</button>
                
                <div className="invoice-container">
                    {/* Header */}
                    <div className="invoice-header">
                        <div className="invoice-logo">
                            <h1>Anywhere</h1>
                            <p>Invoice</p>
                        </div>
                        <div className="invoice-number">
                            <p className="label">Invoice #</p>
                            <p className="number">{String(order?.id).padStart(6, '0')}</p>
                            <p className="date">{new Date(order?.orderedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                    
                    {/* Bill To Section */}
                    <div className="invoice-section">
                        <div className="invoice-column">
                            <h3>Bill to</h3>
                            <p className="customer-name">{user?.fullName || user?.name}</p>
                            <p>{user?.phone}</p>
                            <p>{user?.email}</p>
                        </div>
                        <div className="invoice-column">
                            <h3>Delivery Address</h3>
                            <p>{order?.deliveryAddress}</p>
                        </div>
                    </div>
                    
                    {/* Items Table */}
                    <div className="invoice-items">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                    <th style={{ textAlign: 'right' }}>Price</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.productName}</td>
                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>Rs.{Number(item.price).toFixed(2)}</td>
                                        <td style={{ textAlign: 'right' }}>Rs.{(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Totals */}
                    <div className="invoice-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>Rs.{(order?.items?.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0) || 0).toFixed(2)}</span>
                        </div>
                        <div className="total-row final">
                            <span>Total</span>
                            <span>Rs.{Number(order?.totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    {/* Payment Info */}
                    <div className="invoice-payment">
                        <h3>Payment Details</h3>
                        <div className="payment-grid">
                            <div>
                                <span className="label">Method</span>
                                <p>{payment?.paymentMethod || order?.paymentMethod}</p>
                            </div>
                            <div>
                                <span className="label">Status</span>
                                <p className="status-badge">{payment?.paymentStatus}</p>
                            </div>
                            <div>
                                <span className="label">Transaction ID</span>
                                <p>{payment?.transactionId}</p>
                            </div>
                            <div>
                                <span className="label">Date</span>
                                <p>{new Date(payment?.paymentTime || order?.orderedAt).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="invoice-footer">
                        <p>Thank you for using Anywhere</p>
                        <p className="contact">Contact: support@anywhere.local</p>
                        <p className="copyright">© 2026 Anywhere Delivery Services</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="invoice-actions">
                        <button className="btn-primary" onClick={() => downloadInvoicePDF(order, payment, user)}>
                            📥 Download
                        </button>
                        <button className="btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
