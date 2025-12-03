/**
 * RTableWeb - Rodistaa Web Table Component
 * Wrapper around Ant Design Table with Rodistaa theming
 * Note: Requires 'antd' to be installed in the portal package
 */

import React, { CSSProperties } from 'react';
import { RodistaaColors } from '../../tokens/colors';
import { RodistaaSpacing } from '../../tokens/spacing';

export interface RTableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number | string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface RTableWebProps {
  columns: RTableColumn[];
  dataSource: any[];
  loading?: boolean;
  pagination?: boolean | object;
  rowKey?: string | ((record: any) => string);
  onRow?: (record: any) => any;
  className?: string;
  style?: CSSProperties;
}

export const RTableWeb: React.FC<RTableWebProps> = ({
  columns,
  dataSource,
  loading = false,
  pagination = true,
  rowKey = 'id',
  onRow,
  className = '',
  style,
}) => {
  // This is a simplified version. In actual implementation, use Ant Design Table
  // with custom Rodistaa theme
  
  const tableStyles: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    ...style,
  };

  const headerStyles: CSSProperties = {
    backgroundColor: RodistaaColors.background.paper,
    borderBottom: `2px solid ${RodistaaColors.border.default}`,
  };

  const cellStyles: CSSProperties = {
    padding: `${RodistaaSpacing.sm}px ${RodistaaSpacing.md}px`,
    textAlign: 'left',
    color: RodistaaColors.text.primary,
  };

  return (
    <div className={className}>
      <table style={tableStyles}>
        <thead>
          <tr style={headerStyles}>
            {columns.map((col) => (
              <th key={col.key} style={{ ...cellStyles, fontWeight: '600' }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ ...cellStyles, textAlign: 'center' }}>
                Loading...
              </td>
            </tr>
          ) : dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...cellStyles, textAlign: 'center' }}>
                No data
              </td>
            </tr>
          ) : (
            dataSource.map((record, index) => (
              <tr
                key={typeof rowKey === 'function' ? rowKey(record) : record[rowKey]}
                style={{ borderBottom: `1px solid ${RodistaaColors.border.light}` }}
                {...(onRow ? onRow(record) : {})}
              >
                {columns.map((col) => (
                  <td key={col.key} style={cellStyles}>
                    {col.render
                      ? col.render(record[col.dataIndex], record, index)
                      : record[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RTableWeb;

