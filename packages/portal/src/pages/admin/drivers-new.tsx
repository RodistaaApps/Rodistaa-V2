import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { DriversList } from "@/modules/drivers/DriversList";
import { useTheme } from "@/contexts/ThemeContext";

const DriversPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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
        <DriversList theme={theme} />
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

export default DriversPage;
