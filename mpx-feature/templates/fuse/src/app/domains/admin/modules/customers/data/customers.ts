import { computed, inject, Service } from '@angular/core';
import { add, isAfter } from 'date-fns';
import {
  Customer,
  Order,
  OrdersService,
} from '@/app/domains/admin/modules/orders/data/orders';

export type Segment = 'new' | 'returning' | 'vip' | 'at-risk';

export type CustomerItem = Customer & {
  orders: Order[];
  orderCount: number;
  spent: number;
  average: number;
  lastOrderAt: string;
  segment: Segment;
};

@Service()
export class CustomersService {
  // Dependencies
  private ordersService = inject(OrdersService);

  // Data
  readonly customers = computed(() => {
    const orders = this.ordersService.orders();

    return [
      ...new Map(
        orders.map((order) => [order.customer.id, order.customer])
      ).values(),
    ].map((customer): CustomerItem => {
      const customerOrders = orders
        .filter((order) => order.customer === customer)
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
      const spent = customerOrders.reduce(
        (sum, order) => sum + order.total - order.refunded,
        0
      );
      const lastOrderAt = customerOrders[0].placedAt;

      return {
        ...customer,
        orders: customerOrders,
        orderCount: customerOrders.length,
        spent,
        average: spent / customerOrders.length,
        lastOrderAt,
        segment: this.segment(customer.since, lastOrderAt, spent),
      };
    });
  });

  byId(id: string) {
    return this.customers().find((customer) => customer.id === id) ?? null;
  }

  // Lapsed buyers read as at risk even when their spend qualifies as VIP
  private segment(since: string, lastOrderAt: string, spent: number): Segment {
    const now = new Date();

    if (isAfter(since, add(now, { days: -30 }))) {
      return 'new';
    }

    if (!isAfter(lastOrderAt, add(now, { days: -45 }))) {
      return 'at-risk';
    }

    return spent >= 500 ? 'vip' : 'returning';
  }
}
