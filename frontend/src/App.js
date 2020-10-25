import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Link,
} from "react-router-dom";
import "./App.scss";

import { Layout, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import LoginPage from "./pages/login";
import ProductsPage from "./pages/products";
import ProductsListPage from "./pages/productsList";
import BidsPage from "./pages/bids";
import UserPage from "./pages/user";
import ManageProductsPage from "./pages/manageProducts";

import callApi from "./utils/callApi";

function App() {
  let history = useHistory();
  const { Header, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [role, setRole] = useState(false);

  const fetchRole = async () => {
    const resp = await callApi("/role/", "GET", {}, token);
    if (resp.status === 200) {
      setRole(resp.data.role);
    }
  };

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setToken();
    window.location.reload(false);
  };

  useEffect(() => {
    if (token) {
      fetchRole();
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Layout>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="logo" />
            <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
              {token && (
                <>
                  <Menu.Item key="1" icon={<UserOutlined />}>
                    <Link to="/user">View Profile</Link>
                  </Menu.Item>
                  {role && (
                    <Menu.Item key="addProduct" icon={<UserOutlined />}>
                      <Link to="/manageProducts">Manage Products</Link>
                    </Menu.Item>
                  )}
                </>
              )}

              <Menu.Item key="2" icon={<VideoCameraOutlined />}>
                <Link to="/products">View Products</Link>
              </Menu.Item>

              <Menu.Item key="3" icon={<UploadOutlined />}>
                <Link to="/bids">My Bids</Link>
              </Menu.Item>

              {!token && (
                <Menu.Item key="4" icon={<LoginOutlined />}>
                  <Link to="/products">Login</Link>
                </Menu.Item>
              )}
              {token && (
                <Menu.Item
                  key="5"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              )}
            </Menu>
          </Sider>
          <Layout className="site-layout">
            <Header className="site-layout-background" style={{ padding: 0 }}>
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: toggle,
                }
              )}
            </Header>
            <Content
              className="site-layout-background"
              style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 280,
              }}
            >
              <Switch>
                <Route exact path="/" component={ProductsListPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/products/:id" component={ProductsPage} />
                <Route path="/products" component={ProductsListPage} />
                <Route path="/bids" component={BidsPage} />
                <Route path="/user" component={UserPage} />
                <Route
                  path="/manageProducts/:id?"
                  component={ManageProductsPage}
                />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
