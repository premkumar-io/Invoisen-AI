import test from 'node:test';
import assert from 'node:assert/strict';
import { derivePaymentState } from './invoice.service.js';

test('derivePaymentState reports partial payment and overdue conditions correctly', () => {
  const result = derivePaymentState({
    total: 1000,
    amountPaid: 300,
    dueDate: new Date('2024-01-10T00:00:00.000Z'),
    status: 'published',
    now: new Date('2024-01-11T00:00:00.000Z'),
  });

  assert.equal(result.amountDue, 700);
  assert.equal(result.paymentStatus, 'partially_paid');
});

test('derivePaymentState marks invoices as paid when full payment is recorded', () => {
  const result = derivePaymentState({
    total: 250,
    amountPaid: 250,
    dueDate: new Date('2024-01-10T00:00:00.000Z'),
    status: 'published',
    now: new Date('2024-01-11T00:00:00.000Z'),
  });

  assert.equal(result.amountDue, 0);
  assert.equal(result.paymentStatus, 'paid');
});

test('derivePaymentState handles floating point inaccuracies', () => {
  const result = derivePaymentState({
    total: 100.3,
    amountPaid: 50.1 + 50.2,
    dueDate: new Date('2024-01-10T00:00:00.000Z'),
    status: 'published',
    now: new Date('2024-01-11T00:00:00.000Z'),
  });

  assert.equal(result.amountDue, 0);
  assert.equal(result.paymentStatus, 'paid');
});

test('derivePaymentState handles overpayment', () => {
  const result = derivePaymentState({
    total: 100,
    amountPaid: 150,
    dueDate: new Date('2024-01-10T00:00:00.000Z'),
    status: 'published',
    now: new Date('2024-01-11T00:00:00.000Z'),
  });

  assert.equal(result.amountDue, 0);
  assert.equal(result.paymentStatus, 'paid');
});
