import React from "react";
import {Outlet} from "react-router-dom";

function PrivateRoute({role, accessible}){
  if (accessible === "all" && (role !== "" || !role)) {
    return <Outlet />;
  }
  else if (Array.isArray(accessible)) {
    if (accessible.includes(role)) {
      return <Outlet />;
    }
  }
  else if(role === accessible) {
    return <Outlet />;
  }
  return <>
      <h1 class="text-center">401 Unauthorized</h1>
  </>
}

export default PrivateRoute;