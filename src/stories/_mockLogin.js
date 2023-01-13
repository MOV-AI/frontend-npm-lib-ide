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
          "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSZWZyZXNoIiwiaXNzIjoiYmFja2VuZCIsImlhdCI6MTY3MzUzOTk0MCwiZXhwIjoxNjc0MTQ0NzQwLCJqdGkiOiI3MTkzOTU0Yi1kNTNmLTRkZjUtYjgyMy1iZTE0Zjc3YTU4MDYiLCJyZWZyZXNoX2lkIjoiIiwiZG9tYWluX25hbWUiOiJpbnRlcm5hbCIsImFjY291bnRfbmFtZSI6ImFkbWluIiwiY29tbW9uX25hbWUiOiJBZG1pbiIsInVzZXJfdHlwZSI6IklOVEVSTkFMIiwicm9sZXMiOlsiQURNSU4iXSwiZW1haWwiOiIiLCJzdXBlcl91c2VyIjp0cnVlLCJyZWFkX29ubHkiOmZhbHNlLCJzZW5kX3JlcG9ydCI6ZmFsc2V9.xA5ylBvX-z6T6YkvsC48xfGCB81SEaUpVSb9mkRZBCg",
          "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBY2Nlc3MiLCJpc3MiOiJiYWNrZW5kIiwiaWF0IjoxNjczNTM5OTQwLCJleHAiOjE2NzM1NDM1NDAsImp0aSI6ImM5ZTg2MjllLTYxNjktNDMxMi05ZTM4LThlNDliZjA1YzRkYyIsInJlZnJlc2hfaWQiOiI3MTkzOTU0Yi1kNTNmLTRkZjUtYjgyMy1iZTE0Zjc3YTU4MDYiLCJkb21haW5fbmFtZSI6ImludGVybmFsIiwiYWNjb3VudF9uYW1lIjoiYWRtaW4iLCJjb21tb25fbmFtZSI6IkFkbWluIiwidXNlcl90eXBlIjoiSU5URVJOQUwiLCJyb2xlcyI6WyJBRE1JTiJdLCJlbWFpbCI6IiIsInN1cGVyX3VzZXIiOnRydWUsInJlYWRfb25seSI6ZmFsc2UsInNlbmRfcmVwb3J0IjpmYWxzZX0.TFBwwtEbg-rY_zjz5RZSrHNqEpC4gPI8fF_dmSOPBU0",
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
