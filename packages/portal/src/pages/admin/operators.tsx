import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import AdminLayout from "@/components/Layout/AdminLayout";
import OperatorsList from "@/modules/operators/OperatorsList";

interface OperatorsPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const OperatorsPage: React.FC<OperatorsPageProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <>
      <Head>
        <title>Operators Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all operators and their fleets in the Rodistaa platform"
        />
      </Head>
      <AdminLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
        <OperatorsList isDarkMode={isDarkMode} />
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

export default OperatorsPage;
