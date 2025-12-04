/**
 * RTableWeb Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RTableWeb } from './RTableWeb';

const meta: Meta<typeof RTableWeb> = {
  title: 'Web/RTableWeb',
  component: RTableWeb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RTableWeb>;

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Shipper' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Operator' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Driver' },
];

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
];

export const Default: Story = {
  args: {
    columns,
    dataSource: sampleData,
    rowKey: 'id',
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    dataSource: sampleData,
    rowKey: 'id',
    pagination: {
      current: 1,
      pageSize: 10,
      total: 100,
    },
  },
};

export const Loading: Story = {
  args: {
    columns,
    dataSource: [],
    rowKey: 'id',
    loading: true,
  },
};

