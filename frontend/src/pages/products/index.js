import React, { useState, useEffect } from "react";
import {
  Image,
  Button,
  Statistic,
  Row,
  Col,
  Card,
  Modal,
  Form,
  Input,
  message,
  Table,
} from "antd";
import { useParams, useHistory } from "react-router-dom";
import callApi from "../../utils/callApi";
import randomAnimal from "../../utils/animals";
import moment from "moment";
// CSS
import "./style.scss";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const columns = [
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    key: "timestamp",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
  },
];
const ProductsPage = () => {
  let history = useHistory();

  const [product, setProduct] = useState();
  const [bids, setBids] = useState();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [permissions, setPermissions] = useState(false);
  const [bidsData, setBidsData] = useState([]);

  const { id } = useParams();

  const token = sessionStorage.getItem("token");

  const fetchProducts = async () => {
    const resp = await callApi(
      "/products" + "?productId=" + parseInt(id) + "&format=json",
      "GET",
      {},
      token
    );
    if (resp.status === 200) {
      setProduct(resp.data[0]);
    }
  };

  const fetchBids = async () => {
    const resp = await callApi(
      "/bids" + "?productId=" + id + "&format=json",
      "GET",
      {},
      token
    );
    console.log(resp);
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
  };

  const postBid = async () => {
    if (amount >= product.minimumBid && amount <= product.maximumBid) {
      const resp = await callApi(
        "/bids/",
        "POST",
        {
          productId: id,
          amount: parseFloat(amount),
        },
        token
      );
      if (resp.status === 200) {
        message.success("Successfully placed bid.");
      }
    } else {
      message.error("Please enter valid amount.");
    }
  };

  const fetchPermissions = async () => {
    const resp = await callApi(
      "/productPermission?productId=" + id,
      "GET",
      {},
      token
    );

    if (resp.status === 200) {
      setPermissions(resp.data.isSeller);
    }
  };
  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    fetchBids();
    fetchPermissions();
  }, [product]);
  const handlePlaceBid = () => {
    setOpen(true);
  };

  const handleAwardBid = async (bidId) => {
    const resp = await callApi(
      "/awardBid/",
      "POST",
      {
        winningBid: bidId,
      },
      token
    );

    if (resp.status === 200) {
      message.success("Successfully awarded bid.");
    } else {
      message.error("Failed in awarding bid.");
      console.log(resp);
    }
  };
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = () => {
    postBid();
  };
  return (
    <div id="products">
      <div className="content">
        <div className="product">
          <div className="product-image">
            <Image width={250} src={product && product.photo} />
          </div>
          <h1 className="product-name">{product && product.name}</h1>
          {/*<p className="product-details">
            a container that coffee and espresso-based drinks are served in
          </p>*/}
          <div class="actions">
            {!permissions && (
              <Button
                type="primary"
                block
                className="place-bid"
                shape="round"
                onClick={handlePlaceBid}
                disabled={product && product.winningBid ? true : false}
              >
                {product && product.winningBid
                  ? "Bidding Expired"
                  : "Place Bid"}
              </Button>
            )}
          </div>

          <Row gutter={16}>
            <Col span={24}>
              <Statistic
                title="Bid Expiration"
                value={product && moment(product.expiration).fromNow()}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Min Bid (PHP)"
                value={product && product.minimumBid}
                precision={2}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Max Bid (PHP)"
                value={product && product.maximumBid}
                precision={2}
              />
            </Col>
          </Row>
        </div>
        <div className="details">
          <Card bordered={false} title="Product Description">
            {product && product.description}
          </Card>
          <Card
            style={{ marginTop: 16 }}
            bordered={false}
            title="Live Bidding"
            className="current-bids"
          >
            {bids &&
              !permissions &&
              bids.map((bid) => (
                <p key={bid.bidId}>
                  Anonymous {randomAnimal()} placed a bid on{" "}
                  {product && product.name} on {moment(bid.datetime).fromNow()}
                </p>
              ))}
            {bidsData && permissions && (
              <Table dataSource={bidsData} columns={columns} />
            )}
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="Place Bid"
        visible={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter valid amount" }]}
          >
            <Input type="number" value={amount} onChange={handleAmountChange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
