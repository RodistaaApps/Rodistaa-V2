import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import AdminLayout from "@/components/Layout/AdminLayout";
import ShippersList from "@/modules/shippers/ShippersList";

interface ShippersPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ShippersPage: React.FC<ShippersPageProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <>
      <Head>
        <title>Shippers Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all shippers in the Rodistaa platform"
        />
      </Head>
      <AdminLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
        <ShippersList isDarkMode={isDarkMode} />
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
