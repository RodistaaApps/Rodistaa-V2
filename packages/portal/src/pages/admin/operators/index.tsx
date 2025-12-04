import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { OperatorsList } from "@/modules/operators/OperatorsList";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/router";

const OperatorsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleViewOperator = (operatorId: string) => {
    router.push(`/admin/operators/${operatorId}`);
  };

  return (
    <>
      <Head>
        <title>Operators Management - Rodistaa Admin</title>
        <meta
          name="description"
          content="Manage and monitor all operators and their fleets in the Rodistaa platform"
        />
      </Head>
      <AdminLayout theme={theme} toggleTheme={toggleTheme}>
        <OperatorsList theme={theme} onViewOperator={handleViewOperator} />
      </AdminLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default OperatorsPage;
