export function login(username, password) {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:3001/authentication/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"username": "${username.replace('/"/g', "'")}", "password": "${password.replace('/"/g', "'")}"}`, // admin account is admin admin
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 200) {
          // I set the localstorage in login.js
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function logout() {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:3001/authentication/logout`, {
      method: "GET",
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 200) {
          localStorage.removeItem('user');
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function registration(username, password, address, role, webpage, filename, sellerPDFUrl, xmlContent) {
  return new Promise((resolve, reject) => {
    fetch("http://localhost:3001/authentication/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.replace('/"/g', "'"), password: password.replace('/"/g', "'"), address, role, filename, sellerPDFUrl, xmlContent, webpage }),
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 201) {
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getUserById(userId) {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:3001/authentication/user/${userId}`, {
      method: "GET",
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((user) => resolve(user)).catch(() => reject(res));
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function updateUserById(userId, username, newPassword = null,) {
  return new Promise((resolve, reject) => {
    let body = { username };
    if (newPassword) {
      body.password = newPassword;
    }
    fetch(`http://localhost:3001/authentication/user/${userId}`, {
      method: "PUT",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 200) {
          resolve()
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}