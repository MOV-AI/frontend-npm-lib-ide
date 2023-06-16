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
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSZWZyZXNoIiwiaXNzIjoiYmFja2VuZCIsImlhdCI6MTY4NjgyNTQxNywiZXhwIjoxNjg3NDMwMjE3LCJqdGkiOiI4YWYxYjc5Ny0wNDU4LTRjNzctOGNmYS03ZjE2MWNiZDYwOTUiLCJyZWZyZXNoX2lkIjoiIiwiZG9tYWluX25hbWUiOiJpbnRlcm5hbCIsImFjY291bnRfbmFtZSI6ImFkbWluIiwiY29tbW9uX25hbWUiOiJBZG1pbiIsInVzZXJfdHlwZSI6IklOVEVSTkFMIiwicm9sZXMiOlsiQURNSU4iXSwiZW1haWwiOiIiLCJzdXBlcl91c2VyIjp0cnVlLCJyZWFkX29ubHkiOmZhbHNlLCJzZW5kX3JlcG9ydCI6ZmFsc2V9.Jy25NErfvOEhs4Nfbk8DS9jqnkAEjKScRoVsgxWjMEs",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBY2Nlc3MiLCJpc3MiOiJiYWNrZW5kIiwiaWF0IjoxNjg2ODI1NDE3LCJleHAiOjE2ODY4MjkwMTcsImp0aSI6IjdhODgwYjM5LWZhMDUtNGJmMi04NDI0LWMwMWNmMGUyYzNlNSIsInJlZnJlc2hfaWQiOiI4YWYxYjc5Ny0wNDU4LTRjNzctOGNmYS03ZjE2MWNiZDYwOTUiLCJkb21haW5fbmFtZSI6ImludGVybmFsIiwiYWNjb3VudF9uYW1lIjoiYWRtaW4iLCJjb21tb25fbmFtZSI6IkFkbWluIiwidXNlcl90eXBlIjoiSU5URVJOQUwiLCJyb2xlcyI6WyJBRE1JTiJdLCJlbWFpbCI6IiIsInN1cGVyX3VzZXIiOnRydWUsInJlYWRfb25seSI6ZmFsc2UsInNlbmRfcmVwb3J0IjpmYWxzZX0.fguRrPA4iNWaVUUk9AMxQge10S0s9dsqDTrYS4a6QIY",
    "error": false
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
