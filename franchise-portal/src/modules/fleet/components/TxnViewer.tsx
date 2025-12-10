/**
 * TxnViewer Component
 * 
 * Displays provider transaction ID and raw JSON snapshot.
 * Includes copy-to-clipboard and formatted JSON view.
 */

import { Card, Button, Space, message, Collapse } from 'antd';
import { CopyOutlined, CodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface TxnViewerProps {
  txnId: string;
  provider: string;
  rawData: Record<string, any>;
  fetchedAt: string;
  theme?: 'light' | 'dark';
}

export function TxnViewer({ 
  txnId, 
  provider, 
  rawData, 
  fetchedAt, 
  theme = 'dark' 
}: TxnViewerProps) {
  const [expanded, setExpanded] = useState(false);

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const bgCode = isDark ? '#0A0E14' : '#F3F4F6';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  const handleCopy = () => {
    navigator.clipboard.writeText(txnId);
    message.success('Transaction ID copied to clipboard');
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    message.success('JSON data copied to clipboard');
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${provider}_${txnId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('JSON downloaded');
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: textPrimary }}>
            <CodeOutlined style={{ marginRight: '8px' }} />
            {provider} Snapshot
          </span>
          <Space>
            <Button size="small" icon={<CopyOutlined />} onClick={handleCopyJSON}>
              Copy JSON
            </Button>
            <Button size="small" icon={<DownloadOutlined />} onClick={handleDownloadJSON}>
              Download
            </Button>
          </Space>
        </div>
      }
      style={{ background: bgCard, border: `1px solid ${border}` }}
    >
      {/* Transaction ID */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>
          Transaction ID
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 12px',
          background: bgCode,
          borderRadius: '4px',
          border: `1px solid ${border}`,
        }}>
          <code style={{ 
            flex: 1, 
            color: textPrimary, 
            fontFamily: 'monospace',
            fontSize: '13px',
          }}>
            {txnId}
          </code>
          <Button 
            size="small" 
            icon={<CopyOutlined />} 
            onClick={handleCopy}
          />
        </div>
      </div>

      {/* Fetched timestamp */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: textSecondary, fontSize: '12px', marginBottom: '4px' }}>
          Fetched At
        </div>
        <div style={{ color: textPrimary }}>
          {dayjs(fetchedAt).format('DD MMM YYYY, HH:mm:ss')}
          <span style={{ color: textSecondary, marginLeft: '8px' }}>
            ({dayjs(fetchedAt).fromNow()})
          </span>
        </div>
      </div>

      {/* JSON Data */}
      <Collapse
        activeKey={expanded ? ['json'] : []}
        onChange={(keys) => setExpanded(keys.includes('json'))}
        items={[
          {
            key: 'json',
            label: 'Raw JSON Data',
            children: (
              <pre style={{ 
                background: bgCode,
                color: textPrimary,
                padding: '16px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}>
                {JSON.stringify(rawData, null, 2)}
              </pre>
            ),
          },
        ]}
      />
    </Card>
  );
}

