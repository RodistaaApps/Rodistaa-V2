import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import AdminLayout from "@/components/Layout/AdminLayout";
import DriversList from "@/modules/drivers/DriversList";

interface DriversPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const DriversPage: React.FC<DriversPageProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <>
      <Head>
        <title>Drivers Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all drivers, track live locations, trips, and behaviour in the Rodistaa platform"
        />
      </Head>
      <AdminLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
        <DriversList isDarkMode={isDarkMode} />
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
