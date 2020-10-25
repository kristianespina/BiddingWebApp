import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useHistory } from "react-router-dom";
import "./style.scss";

import callApi from "../../utils/callApi";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const LoginPage = () => {
  let history = useHistory();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const token = sessionStorage.getItem("token");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const postLogin = async () => {
    const jwt = await callApi("/token-auth/", "POST", {
      username: username,
      password: password,
    });

    if (jwt.status === 200) {
      message.success("Successfully logged in");
      sessionStorage.setItem("token", jwt.data.token);
      history.push("/products");
      window.location.reload(false);
    } else {
      message.error("Unable to login");
    }
  };
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (token) history.push("/products");
  }, [token]);
  return (
    <div id="login">
      <div className="wrapper">
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input value={username} onChange={handleUsernameChange} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password value={password} onChange={handlePasswordChange} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" block onClick={postLogin}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
