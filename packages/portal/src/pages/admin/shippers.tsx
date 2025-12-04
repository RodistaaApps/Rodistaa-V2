import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { ShippersList } from "@/modules/shippers/ShippersList";
import { ShipperDetailPanel } from "@/modules/shippers/ShipperDetailPanel";
import { useTheme } from "@/contexts/ThemeContext";

const ShippersPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedShipperId, setSelectedShipperId] = useState<string | null>(
    null,
  );

  const handleViewShipper = (shipperId: string) => {
    setSelectedShipperId(shipperId);
  };

  const handleCloseDetail = () => {
    setSelectedShipperId(null);
  };

  return (
    <>
      <Head>
        <title>Shippers Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all shippers in the Rodistaa platform"
        />
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <ShippersList theme={theme} onViewShipper={handleViewShipper} />
        {selectedShipperId && (
          <ShipperDetailPanel
            shipperId={selectedShipperId}
            visible={!!selectedShipperId}
            onClose={handleCloseDetail}
            theme={theme}
          />
        )}
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Add authentication check here
  // const session = await getSession(context);
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: '/login',
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {},
  };
};

export default ShippersPage;
