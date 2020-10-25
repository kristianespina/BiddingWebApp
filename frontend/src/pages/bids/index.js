import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Tag } from "antd";

import callApi from "../../utils/callApi";

const columns = [
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    key: "timestamp",
  },
  {
    title: "Product Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

const BidsPage = () => {
  let history = useHistory();
  const token = sessionStorage.getItem("token");
  const [dataSource, setDataSource] = useState([]);
  const fetchBids = async () => {
    const resp = await callApi("/mybids", "GET", {}, token);
    console.log(resp);
    if (resp.status === 200) {
      const tags = [
        <Tag color="error">Expired</Tag>,
        <Tag color="processing">On-going</Tag>,
        <Tag color="success">Bid Won</Tag>,
      ];

      const tableSrc = resp.data.map((bid) => ({
        key: bid.datetime,
        name: bid.productName,
        timestamp: bid.datetime,
        amount: bid.amount,
        status: tags[bid.status],
      }));
      setDataSource(tableSrc);
    }
  };

  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchBids();
    }
  }, []);

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
};

export default BidsPage;
