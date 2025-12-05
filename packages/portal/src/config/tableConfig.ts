/**
 * Rodistaa Standard Table Configuration
 * 
 * Reusable configuration for all list pages to ensure:
 * - Consistent UX across all modules
 * - Optimal performance with large datasets
 * - Virtual scrolling for smooth rendering
 * - Sticky headers for context retention
 */

export const RODISTAA_TABLE_CONFIG = {
  // Virtual scrolling for performance (handles 10,000+ rows smoothly)
  virtual: true,
  
  // Scrollable area with fixed height
  scroll: { 
    y: 600,  // Fixed height: 600px (shows ~15-20 rows depending on row height)
    x: 1400  // Horizontal scroll for wide tables
  },
  
  // Sticky headers (headers stay visible while scrolling)
  sticky: true,
  
  // Table size
  size: 'middle' as const,
};

export const RODISTAA_PAGINATION_CONFIG = {
  // Default page size (good balance)
  defaultPageSize: 100,
  
  // Page size options (up to 500 for power users)
  pageSizeOptions: ['50', '100', '200', '500'],
  
  // Show page size selector
  showSizeChanger: true,
  
  // Quick jump to page (type page number)
  showQuickJumper: true,
  
  // Better info display
  showTotal: (total: number, range: [number, number]) => 
    `Showing ${range[0].toLocaleString()}-${range[1].toLocaleString()} of ${total.toLocaleString()}`,
  
  // Position
  position: ['bottomRight'] as const,
};

/**
 * Helper to merge Rodistaa config with page-specific config
 */
export const createTableConfig = (overrides?: any) => ({
  ...RODISTAA_TABLE_CONFIG,
  ...overrides,
});

export const createPaginationConfig = (pageConfig: {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
}) => ({
  ...RODISTAA_PAGINATION_CONFIG,
  ...pageConfig,
});

