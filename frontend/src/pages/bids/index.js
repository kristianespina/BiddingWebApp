import React from "react";

import { Table, Tag, Button } from "antd";

const BidsPage = () => {
  const dataSource = [
    {
      key: "1",
      name: "Mike",
      bid: 32,
      status: <Tag color="success">success</Tag>,
      actions: (
        <Button type="primary" className="place-bid" shape="round">
          View Product
        </Button>
      ),
    },
    {
      key: "2",
      name: "John",
      bid: 42,
      status: <Tag color="processing">pending</Tag>,
      actions: (
        <Button type="primary" className="place-bid" shape="round">
          View Product
        </Button>
      ),
    },
  ];

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Bid",
      dataIndex: "bid",
      key: "bid",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
    },
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />;
    </div>
  );
};

export default BidsPage;
