import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { base64ToUtf8, showConsole } from "../assets/assets";

const useModule = ({
  url,
  method = "GET",
  body = null,
  headers = {},
  enabled = true,
  name = null,
  dependencies = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
      });
      showConsole && console.log(name, response);
      let data = response.data;
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers]);
  const add = async ({ url, method, body, headers }) => {
    setCreating(true);
    setError(null);

    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
      });
      showConsole && console.log(response.data);
    } catch (err) {
      console.log(err)
      setError(err);
    } finally {
      setCreating(false);
    }
  };
  const update = async ({ url, method, body, headers }) => {
    setCreating(true);
    setError(null);

    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
      });
      showConsole && console.log(`${Object.entries(body)} : `, response.data);
    } catch (err) {
      setError(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (enabled) run();
  }, [...dependencies, enabled]);

  return { loading, error, data, setData, refetch: run, add, update };
};

export default useModule;
