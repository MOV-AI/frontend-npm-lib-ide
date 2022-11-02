// Please update the access and refresh token before start your developments
export const authParams = {
  mockData: [
    {
      url: "/token-auth/",
      method: "POST",
      status: 200,
      response: _ => {
        // MUST BE A REAL TOKEN FROM MOVAI BE
        return {
          access_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUb2tlbiIsImlhdCI6MTY2Njk3MTc1MywiZXhwIjoxNjY2OTc1MzUzLCJkb21haW5fbmFtZSI6ImludGVybmFsIiwiYWNjb3VudF9uYW1lIjoicGVkcm8iLCJjb21tb25fbmFtZSI6IlBlZHJvIiwidXNlcl90eXBlIjoiSU5URVJOQUwiLCJyb2xlcyI6WyJEZWZhdWx0Um9sZSJdLCJlbWFpbCI6IiIsInN1cGVyX3VzZXIiOnRydWUsInJlYWRfb25seSI6ZmFsc2UsInNlbmRfcmVwb3J0IjpmYWxzZX0.MTTSuZN4sE8z7CgKSo8Q6iUV4P6ZM3aqoJ5FCQPEJss",
          refresh_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSZWZyZXNoIiwiaWF0IjoxNjY2OTcxNzUzLCJleHAiOjE2Njc1NzY1NTMsImRvbWFpbl9uYW1lIjoiaW50ZXJuYWwiLCJhY2NvdW50X25hbWUiOiJwZWRybyIsImNvbW1vbl9uYW1lIjoiUGVkcm8iLCJ1c2VyX3R5cGUiOiJJTlRFUk5BTCIsInJvbGVzIjpbIkRlZmF1bHRSb2xlIl0sImVtYWlsIjoiIiwic3VwZXJfdXNlciI6dHJ1ZSwicmVhZF9vbmx5IjpmYWxzZSwic2VuZF9yZXBvcnQiOmZhbHNlfQ.cc2AlPn8L0YWF9BPV114aHvL_54kgI_xtmJL6bV7oEA",
          error: false
        };
      }
    },
    {
      url: "/token-refresh/",
      method: "POST",
      status: 200,
      response: _ => {
        return {
          access_token: ""
        };
      }
    },
    {
      url: "/token-verify/",
      method: "POST",
      status: 200,
      response: _ => {
        return {
          result: true
        };
      }
    },
    {
      url: "/domains/",
      method: "GET",
      status: 200,
      response: _ => {
        return {
          domains: ["internal"]
        };
      }
    }
  ]
};
