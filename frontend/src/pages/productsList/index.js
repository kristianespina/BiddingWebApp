import React, { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";

import { Table, Button } from "antd";

import callApi from "../../utils/callApi";

const ProductsListPage = () => {
  let history = useHistory();

  const [products, setProducts] = useState([]);
  const token = sessionStorage.getItem("token");

  const fetchProducts = async () => {
    const resp = await callApi("/products?format=json", "GET", {}, token);
    if (resp && resp.data && resp.data.length) {
      const dataSource = resp.data.map((product) => ({
        key: product.productId,
        name: product.name,
        actions: (
          <Link to={"/products/" + product.productId}>
            <Button type="primary" className="place-bid" shape="round">
              View Product
            </Button>
          </Link>
        ),
      }));
      setProducts(dataSource);
    }
  };

  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchProducts();
    }
  }, []);

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
    },
  ];

  return (
    <div>
      <Table dataSource={products} columns={columns} />
    </div>
  );
};

export default ProductsListPage;
