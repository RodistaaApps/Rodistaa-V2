import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { ShippersList } from "@/modules/shippers/ShippersList";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/router";

const ShippersPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleViewShipper = (shipperId: string) => {
    router.push(`/admin/shippers/${shipperId}`);
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
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default ShippersPage;
