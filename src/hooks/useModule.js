import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useModule = ({
  url,
  method = "GET",
  body = null,
  headers = {},
  enabled = true,
  dependencies = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        url,
        method,
        rowBody: body,
        headers,
      });
      console.log(`${Object.entries(body)} : `, response);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers]);

  useEffect(() => {
    if (enabled) run();
  }, [...dependencies, enabled]);

  return { loading, error, data, refetch: run };
};

export default useModule;
