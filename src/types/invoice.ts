// Invoicing & Payment (Section 16, 17)
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE'
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED'

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  bookingId: string
  ownerName: string
  petName: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: string
  paidAt?: string
}
