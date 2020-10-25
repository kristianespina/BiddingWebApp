import axios from "axios";

const callApi = async (endpoint, method, payload, token) => {
  return new Promise(async (resolve, reject) => {
    const baseUrl = process.env.REACT_APP_API_HOST;
    const options = {
      url: baseUrl + endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `JWT ${token}`,
      },
      data: payload,
    };
    try {
      const response = await axios(options);
      resolve(response);
    } catch (e) {
      resolve({});
    }
  });
};

export default callApi;
