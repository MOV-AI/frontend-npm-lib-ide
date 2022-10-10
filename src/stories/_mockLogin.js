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
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUb2tlbiIsImlhdCI6MTY2NTQwMTY0NSwiZXhwIjoxNjY1NDA1MjQ1LCJkb21haW5fbmFtZSI6ImludGVybmFsIiwiYWNjb3VudF9uYW1lIjoiYWRtaW4iLCJjb21tb25fbmFtZSI6IkFkbWluIiwidXNlcl90eXBlIjoiSU5URVJOQUwiLCJyb2xlcyI6WyJEZWZhdWx0Um9sZSJdLCJlbWFpbCI6IiIsInN1cGVyX3VzZXIiOnRydWUsInJlYWRfb25seSI6ZmFsc2UsInNlbmRfcmVwb3J0IjpmYWxzZX0.dxxq3Zu0xg6BdpMx9tnyIQmJvytqA_wnIKWqFytL4F0",
          refresh_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSZWZyZXNoIiwiaWF0IjoxNjY1NDAxNjQ1LCJleHAiOjE2NjYwMDY0NDUsImRvbWFpbl9uYW1lIjoiaW50ZXJuYWwiLCJhY2NvdW50X25hbWUiOiJhZG1pbiIsImNvbW1vbl9uYW1lIjoiQWRtaW4iLCJ1c2VyX3R5cGUiOiJJTlRFUk5BTCIsInJvbGVzIjpbIkRlZmF1bHRSb2xlIl0sImVtYWlsIjoiIiwic3VwZXJfdXNlciI6dHJ1ZSwicmVhZF9vbmx5IjpmYWxzZSwic2VuZF9yZXBvcnQiOmZhbHNlfQ.OQaAcmqHQhA3fFVxl2AcFozfgVgR5H3VLchXQMNDtmg",
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
