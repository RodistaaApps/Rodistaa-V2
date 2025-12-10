/**
 * Global Search Component (Cmd+K / Ctrl+K)
 * 
 * Universal search across all entities:
 * - Loads, Shipments, Operators, Trucks
 * - CTL/STN numbers, Invoice IDs
 * - User IDs, RC numbers
 * 
 * Features:
 * - Keyboard shortcut (Cmd+K or Ctrl+K)
 * - Recent searches
 * - Quick navigation
 * - Category filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Input, List, Tag, Space, Spin, Empty } from 'antd';
import {
  SearchOutlined,
  CarOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  TruckOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useTheme } from '@/contexts/ThemeContext';
import debounce from 'lodash/debounce';

interface SearchResult {
  id: string;
  type: 'load' | 'shipment' | 'operator' | 'truck' | 'driver' | 'shipper' | 'invoice' | 'ticket';
  title: string;
  subtitle: string;
  url: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  const isDark = theme === 'dark';
  const bgModal = isDark ? '#151922' : '#FFFFFF';
  const bgInput = isDark ? '#0A0E14' : '#F9FAFB';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rodistaa-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches');
      }
    }
  }, []);

  // Search function with debounce
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // TODO: Call actual search API
        // const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        // const data = await response.json();

        // Mock search results
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockResults: SearchResult[] = [
          {
            id: 'LD-001',
            type: 'load',
            title: `Load LD-001`,
            subtitle: 'Hyderabad → Mumbai, Posted 2 days ago',
            url: '/admin/loads/LD-001',
            metadata: { status: 'open', route: 'HYD-MUM' },
          },
          {
            id: 'OP-001',
            type: 'operator',
            title: 'ABC Transport',
            subtitle: 'Operator • Hyderabad',
            url: '/admin/operators/OP-001',
            metadata: { trust_score: 85 },
          },
          {
            id: 'DL01AB1234',
            type: 'truck',
            title: 'DL01AB1234',
            subtitle: 'Tata LPT 2518 • 10T • DXL',
            url: '/admin/fleet/trucks/DL01AB1234',
            metadata: { compliance: 'allowed' },
          },
        ].filter(r => 
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
        );

        setResults(mockResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [
      result,
      ...recentSearches.filter(r => r.id !== result.id),
    ].slice(0, 10); // Keep last 10

    setRecentSearches(updated);
    localStorage.setItem('rodistaa-recent-searches', JSON.stringify(updated));

    // Navigate
    router.push(result.url);
    onClose();
    setSearchQuery('');
  };

  const getIcon = (type: string) => {
    const icons = {
      load: <FileTextOutlined style={{ color: '#3B82F6' }} />,
      shipment: <TruckOutlined style={{ color: '#10B981' }} />,
      operator: <UserOutlined style={{ color: '#F59E0B' }} />,
      truck: <CarOutlined style={{ color: '#8B5CF6' }} />,
      driver: <UserOutlined style={{ color: '#F59E0B' }} />,
      shipper: <UserOutlined style={{ color: '#3B82F6' }} />,
      invoice: <DollarOutlined style={{ color: '#10B981' }} />,
      ticket: <FileTextOutlined style={{ color: '#EF4444' }} />,
    };
    return icons[type as keyof typeof icons] || <SearchOutlined />;
  };

  const getTypeTag = (type: string) => {
    const colors = {
      load: 'blue',
      shipment: 'green',
      operator: 'orange',
      truck: 'purple',
      driver: 'orange',
      shipper: 'blue',
      invoice: 'green',
      ticket: 'red',
    };
    return <Tag color={colors[type as keyof typeof colors]}>{type.toUpperCase()}</Tag>;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
      styles={{
        body: { padding: 0, background: bgModal },
      }}
    >
      <div style={{ background: bgModal }}>
        {/* Search Input */}
        <Input
          size="large"
          placeholder="Search loads, shipments, operators, trucks, invoices..."
          prefix={<SearchOutlined style={{ color: textSecondary }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          style={{
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            background: bgInput,
          }}
          suffix={
            <Space>
              {loading && <Spin size="small" />}
              <Tag style={{ fontSize: '11px' }}>
                {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
              </Tag>
            </Space>
          }
        />

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
          {searchQuery.length === 0 ? (
            // Recent Searches
            recentSearches.length > 0 ? (
              <div>
                <div style={{ 
                  color: textSecondary, 
                  fontSize: '12px', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <ClockCircleOutlined />
                  Recent Searches
                </div>
                <List
                  dataSource={recentSearches}
                  renderItem={(item) => (
                    <List.Item
                      style={{ 
                        cursor: 'pointer', 
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '4px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#1E2430' : '#F3F4F6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => handleResultClick(item)}
                    >
                      <List.Item.Meta
                        avatar={getIcon(item.type)}
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: textPrimary, fontWeight: 500 }}>
                              {item.title}
                            </span>
                            {getTypeTag(item.type)}
                          </div>
                        }
                        description={
                          <span style={{ color: textSecondary, fontSize: '13px' }}>
                            {item.subtitle}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                description={
                  <span style={{ color: textSecondary }}>
                    Start typing to search across all entities
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          ) : results.length > 0 ? (
            // Search Results
            <List
              dataSource={results}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    cursor: 'pointer', 
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? '#1E2430' : '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => handleResultClick(item)}
                >
                  <List.Item.Meta
                    avatar={getIcon(item.type)}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: textPrimary, fontWeight: 500 }}>
                          {item.title}
                        </span>
                        {getTypeTag(item.type)}
                      </div>
                    }
                    description={
                      <span style={{ color: textSecondary, fontSize: '13px' }}>
                        {item.subtitle}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          ) : !loading && searchQuery.length > 0 ? (
            <Empty
              description={
                <span style={{ color: textSecondary }}>
                  No results found for "{searchQuery}"
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : null}
        </div>

        {/* Footer Tips */}
        <div style={{ 
          padding: '12px 16px',
          borderTop: `1px solid ${border}`,
          background: isDark ? '#0A0E14' : '#F9FAFB',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '12px', color: textSecondary }}>
            <span style={{ fontFamily: 'monospace', background: bgInput, padding: '2px 6px', borderRadius: '3px' }}>
              ↑↓
            </span>
            {' '}Navigate
            <span style={{ marginLeft: '12px', fontFamily: 'monospace', background: bgInput, padding: '2px 6px', borderRadius: '3px' }}>
              Enter
            </span>
            {' '}Select
            <span style={{ marginLeft: '12px', fontFamily: 'monospace', background: bgInput, padding: '2px 6px', borderRadius: '3px' }}>
              Esc
            </span>
            {' '}Close
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Hook to use global search
 */
export function useGlobalSearch() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    searchOpen,
    openSearch: () => setSearchOpen(true),
    closeSearch: () => setSearchOpen(false),
  };
}

