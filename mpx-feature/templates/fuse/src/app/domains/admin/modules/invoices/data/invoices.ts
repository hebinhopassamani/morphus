import { computed, inject, Service } from '@angular/core';
import { add, isAfter } from 'date-fns';
import {
  Order,
  OrdersService,
  Transaction,
} from '@/app/domains/admin/modules/orders/data/orders';

export type InvoiceStatus =
  'paid' | 'partially-paid' | 'open' | 'overdue' | 'refunded';

export type InvoiceEvent = {
  id: string;
  type: 'issued' | 'sent' | 'payment' | 'refund' | 'overdue';
  title: string;
  text: string;
  date: string;
};

export type Invoice = Pick<
  Order,
  | 'customer'
  | 'items'
  | 'subtotal'
  | 'discount'
  | 'discountCode'
  | 'shipping'
  | 'tax'
  | 'total'
  | 'paid'
  | 'refunded'
  | 'balance'
  | 'billingAddress'
  | 'paymentMethod'
> & {
  id: string;
  order: Order;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  payments: Transaction[];
  activity: InvoiceEvent[];
};

export const TERMS = 7;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

@Service()
export class InvoicesService {
  // Dependencies
  private ordersService = inject(OrdersService);

  // Data
  readonly invoices = computed(() =>
    this.ordersService.orders().map((order): Invoice => {
      // Own series, offset from the order id so numbers stay stable
      const id = `INV-${Number(order.id) - 8440}`;
      const dueAt = add(order.placedAt, { days: TERMS }).toISOString();
      const status = this.status(order, dueAt);
      const payments = order.transactions.filter(
        (transaction) => transaction.status === 'success'
      );

      return {
        id,
        order,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        discountCode: order.discountCode,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        paid: order.paid,
        refunded: order.refunded,
        balance: order.balance,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        issuedAt: order.placedAt,
        dueAt,
        status,
        payments,
        activity: [
          ...(status === 'overdue'
            ? [
                {
                  id: `${id}-overdue`,
                  type: 'overdue' as const,
                  title: 'Payment overdue',
                  text: `${usd.format(order.balance)} still due`,
                  date: dueAt,
                },
              ]
            : []),
          ...payments
            .map((payment): InvoiceEvent => ({
              id: `${id}-${payment.id}`,
              type: payment.kind === 'refund' ? 'refund' : 'payment',
              title:
                payment.kind === 'refund'
                  ? 'Refund issued'
                  : 'Payment received',
              text: `${usd.format(payment.amount)} on ${order.paymentMethod.label}`,
              date: payment.date,
            }))
            .reverse(),
          {
            id: `${id}-sent`,
            type: 'sent',
            title: 'Invoice sent',
            text: `to ${order.customer.email}`,
            date: order.placedAt,
          },
          {
            id: `${id}-issued`,
            type: 'issued',
            title: 'Invoice issued',
            text: `for order #${order.id}`,
            date: order.placedAt,
          },
        ],
      };
    })
  );

  byId(id: string) {
    return this.invoices().find((invoice) => invoice.id === id) ?? null;
  }

  // Past due outranks a partial payment
  private status(order: Order, dueAt: string): InvoiceStatus {
    if (order.payment === 'refunded') {
      return 'refunded';
    }

    if (!order.balance) {
      return 'paid';
    }

    if (isAfter(new Date(), dueAt)) {
      return 'overdue';
    }

    return order.paid ? 'partially-paid' : 'open';
  }
}
