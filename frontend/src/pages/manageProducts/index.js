import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useHistory, useParams } from "react-router-dom";
import "./style.scss";
import axios from "axios";

import callApi from "../../utils/callApi";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const ManageProductsPage = () => {
  let history = useHistory();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [uploadImage, setUploadImage] = useState({});
  const [dataName, setDataName] = useState("");
  const [payload, setPayload] = useState({
    productId: id,
    name: "",
    photo: {},
    minimumBid: 0,
    maximumBid: 0,
    expiration: "",
    description: "",
  });

  const token = sessionStorage.getItem("token");

  const handlePayloadChange = (data) => {
    setPayload({
      ...payload,
      ...data,
    });
  };

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const handleImage = (e) => {
    const image = e.target.files[0];
    setUploadImage(image);
  };
  const handleSubmit = async () => {
    let formData = new FormData();
    uploadImage &&
      uploadImage.name &&
      formData.append("photo", uploadImage, uploadImage.name);
    formData.append("name", payload.name);
    formData.append("minimumBid", payload.minimumBid);
    formData.append("maximumBid", payload.maximumBid);
    formData.append("expiration", payload.expiration);
    formData.append("description", payload.description);
    formData.append("productId", id);
    let url = process.env.REACT_APP_API_HOST + "/products/";
    const axiosRequest = id ? axios.patch : axios.post;
    const resp = await axiosRequest(url, formData, {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `JWT ${token}`,
      },
    });
  };

  const fetchProducts = async () => {
    const resp = await callApi(
      "/products" + "?productId=" + parseInt(id) + "&format=json",
      "GET",
      {},
      token
    );
    if (resp.status === 200) {
      setPayload(resp.data[0]);
      console.log(resp.data);
      setDataName(resp.data[0].name);

      form.setFieldsValue({
        ...resp.data[0],
        productId: parseInt(id),
        photo: undefined,
        expiration: resp.data[0].expiration.replace("Z", ""),
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    console.log(payload);
  }, [payload]);
  return (
    <div id="login">
      <div className="wrapper">
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          form={form}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input
              onChange={(e) => handlePayloadChange({ name: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="Photo"
            name="photo"
            rules={[{ required: true, message: "Please upload a photo" }]}
          >
            <Input
              type="file"
              value={payload && payload.photo}
              onChange={handleImage}
            />
          </Form.Item>
          <Form.Item
            label="Minimum Bid"
            name="minimumBid"
            rules={[{ required: true, message: "Please enter valid value" }]}
          >
            <Input
              type="number"
              onChange={(e) =>
                handlePayloadChange({ minimumBid: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Maximum Bid"
            name="maximumBid"
            rules={[{ required: true, message: "Please enter valid value" }]}
          >
            <Input
              type="number"
              onChange={(e) =>
                handlePayloadChange({ maximumBid: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Expiration"
            name="expiration"
            rules={[{ required: true, message: "Please enter valid value" }]}
          >
            <Input
              type="datetime-local"
              onChange={(e) =>
                handlePayloadChange({ expiration: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter valid value" }]}
          >
            <Input.TextArea
              onChange={(e) =>
                handlePayloadChange({ description: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Product Id" name="productId" hidden>
            <Input type="number" hidden />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button
              type="primary"
              htmlType="submit"
              block
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ManageProductsPage;
