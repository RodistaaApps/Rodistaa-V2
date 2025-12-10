/**
 * Loading Skeleton Component
 * Provides better perceived performance during data loading
 */

import { Skeleton, Card, Row, Col } from 'antd';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'dashboard' | 'form' | 'list';
  rows?: number;
}

export function LoadingSkeleton({ type = 'card', rows = 3 }: LoadingSkeletonProps) {
  switch (type) {
    case 'dashboard':
      return (
        <div style={{ padding: '24px' }}>
          <Skeleton.Input style={{ width: 300, marginBottom: 24 }} active />
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Card>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
          <Card style={{ marginTop: 24 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </div>
      );

    case 'table':
      return (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 16 }}>
            <Skeleton.Input style={{ width: 200 }} active />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <Card key={i} style={{ marginBottom: 8 }}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </div>
      );

    case 'form':
      return (
        <Card style={{ maxWidth: 600, margin: '24px auto' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
          <Skeleton.Button style={{ width: 120, marginTop: 16 }} active />
        </Card>
      );

    case 'list':
      return (
        <div style={{ padding: '24px' }}>
          {Array.from({ length: rows }).map((_, i) => (
            <Card key={i} style={{ marginBottom: 16 }}>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      );

    case 'card':
    default:
      return (
        <Card style={{ margin: '24px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      );
  }
}

// Individual skeleton components for specific use cases
export function DashboardSkeleton() {
  return <LoadingSkeleton type="dashboard" />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return <LoadingSkeleton type="table" rows={rows} />;
}

export function FormSkeleton() {
  return <LoadingSkeleton type="form" />;
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return <LoadingSkeleton type="list" rows={rows} />;
}

