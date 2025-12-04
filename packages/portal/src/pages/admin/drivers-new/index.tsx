import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { DriversList } from "@/modules/drivers/DriversList";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/router";

const DriversPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleViewDriver = (driverId: string) => {
    router.push(`/admin/drivers-new/${driverId}`);
  };

  return (
    <>
      <Head>
        <title>Drivers Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all drivers, track live locations, trips, and behaviour in the Rodistaa platform"
        />
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <DriversList theme={theme} onViewDriver={handleViewDriver} />
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default DriversPage;
