export function getPendingUsers() {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3001/users/pendingRegistration`, {
        method: "GET",
        credentials: 'include' 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function approveRegistration(sellerId) {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3001/users/approveRegistration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
		body: JSON.stringify({sellerId}),
        credentials: 'include',
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3001/users/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
		body: JSON.stringify({userId}),
        credentials: 'include',
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export function getRole(userId) {
    return new Promise((resolve, reject) => {
        fetch(`https://localhost:3001/users/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
		body: JSON.stringify({userId}),
        credentials: 'include', 
      })
        .then((res) => {
            if (res.status === 200) {
                resolve(res);
            }
            else {
                reject(res);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}