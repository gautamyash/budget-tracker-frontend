const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://budget-tracker-backend-wznx.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.detail || data.message || `HTTP ${res.status}`);
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

const api = {
  get(path) {
    return fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: authHeaders(),
    })
      .then(handleResponse)
      .catch((err) => {
        if (err.status === 401) {
          window.location.href = "/login";
        }
        throw err;
      });
  },

  post(path, body) {
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .catch((err) => {
        if (err.status === 401) {
          window.location.href = "/login";
        }
        throw err;
      });
  },

  put(path, body) {
    return fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .catch((err) => {
        if (err.status === 401) {
          window.location.href = "/login";
        }
        throw err;
      });
  },

  delete(path) {
    return fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then((res) => {
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      return;
    });
  },

  login(username, password) {
    return Promise.race([
      fetch(`${BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).then(handleResponse),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Login timeout - server not responding")),
          15000,
        ),
      ),
    ]);
  },
};

export default api;
