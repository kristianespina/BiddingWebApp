import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Avatar, Statistic, Row, Col } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import callApi from "../../utils/callApi";

import "./style.scss";
const UserPage = () => {
  let history = useHistory();
  const token = sessionStorage.getItem("token");
  const [role, setRole] = useState(false);
  const [statistics, setStatistics] = useState({});

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

  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchRole();
      fetchStatistics();
    }
  }, []);

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
