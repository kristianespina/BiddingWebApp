import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Avatar, Statistic, Row, Col, Button } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import callApi from "../../utils/callApi";

import "./style.scss";
const UserPage = () => {
  let history = useHistory();
  const token = sessionStorage.getItem("token");
  const [role, setRole] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const fetchRole = async () => {
    const resp = await callApi("/role/", "GET", {}, token);
    if (resp.status === 200) {
      setRole(resp.data.role);
    }
  };

  const fetchStatistics = async () => {
    const resp = await callApi("/statistics/", "GET", {}, token);
    if (resp.status === 200) {
      setStatistics(resp.data);
    }
  };

  const fetchBids = async () => {
    const resp = await callApi("/mybids", "GET", {}, token);
    console.log(resp);
    if (resp.status === 200) {
      const tableSrc = resp.data.map((bid) => ({
        key: bid.datetime,
        name: bid.productName,
        timestamp: bid.datetime,
        amount: bid.amount,
        status: bid.status,
      }));
      setDataSource(tableSrc);
    }
    /*
    if (resp.status === 200) {
      setBids(resp.data);
      const tableSrc = resp.data.map((bid) => ({
        key: bid.datetime,
        timestamp: bid.datetime,
        amount: bid.amount,
        actions: (
          <Button
            block
            className="place-bid"
            shape="round"
            onClick={() => handleAwardBid(bid.bidId)}
            disabled={product && product.winningBid ? true : false}
          >
            Award Bid
          </Button>
        ),
      }));
      setBidsData(tableSrc);
    }
    */
  };

  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchRole();
      fetchStatistics();
      fetchBids();
    }
  }, []);

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

  return (
    <div id="user">
      <Avatar
        size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
        icon={<AntDesignOutlined />}
      />
      <h1 className="name">Anonymous Panda</h1>

      {!role && (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Remaining Credits"
                value={
                  statistics && statistics.credits && statistics.credits[0]
                }
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Committed Credits"
                value={
                  (statistics &&
                    statistics.committed &&
                    statistics.committed.amount__sum) ||
                  0
                }
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Spent Credits"
                value={
                  (statistics &&
                    statistics.spent &&
                    statistics.spent.amount__sum) ||
                  0
                }
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Bids Placed"
                value={statistics && statistics.bidsCount}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Bids Won"
                value={statistics && statistics.bidsWon}
              />
            </Col>
          </Row>
          <Table dataSource={dataSource} columns={columns} />
        </>
      )}

      {role && (
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Products Count"
              value={statistics && statistics.productsCount}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Ongoing Bidding"
              value={statistics && statistics.bidsCount}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Done Deals"
              value={statistics && statistics.dealsClosedCount}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Total Earnings (Credits)"
              value={
                (statistics &&
                  statistics.earnings &&
                  statistics.earnings.amount__sum) ||
                0
              }
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Avg. Potential Earnings (Credits)"
              value={
                statistics &&
                statistics.potentialMin &&
                statistics.potentialMax &&
                (statistics.potentialMin.minimumBid__avg +
                  statistics.potentialMax.maximumBid__avg) /
                  2
              }
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default UserPage;
