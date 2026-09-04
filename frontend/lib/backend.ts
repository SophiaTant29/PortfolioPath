import "server-only";

const API=process.env.API_BASE_URL || "http://127.0.0.1:8000";
const SECRET=process.env.BACKEND_SHARED_SECRET;

export async function backendFetch(path:string,init:RequestInit={}){
  const clean=path.startsWith("/")?path:`/${path}`;
  const headers=new Headers(init.headers);
  // Optional for demo deployments; required before opening public signup.
  if(SECRET) headers.set("x-portfoliopath-backend-key",SECRET);
  return fetch(`${API.replace(/\/$/,"")}${clean}`,{...init,headers});
}
