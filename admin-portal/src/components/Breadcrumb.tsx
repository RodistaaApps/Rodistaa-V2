/**
 * Breadcrumb Component - Consistent navigation trail
 */

import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export function Breadcrumb() {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    {
      title: <><HomeOutlined /> <span>Home</span></>,
      href: '/admin/dashboard',
    },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      return {
        title,
        href: index === pathSegments.length - 1 ? undefined : path,
      };
    }),
  ];

  return (
    <AntBreadcrumb 
      items={breadcrumbItems}
      style={{ marginBottom: '16px' }}
    />
  );
}

