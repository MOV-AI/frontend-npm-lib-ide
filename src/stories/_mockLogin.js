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
          refresh_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSZWZyZXNoIiwiaXNzIjoiYmFja2VuZCIsImlhdCI6MTY3NjIwNTEwMCwiZXhwIjoxNjc2ODA5OTAwLCJqdGkiOiJkNWVjZmZkZC0wODc1LTRiNGEtOTE1NC1kMTMxZWY3YjQyYjIiLCJyZWZyZXNoX2lkIjoiIiwiZG9tYWluX25hbWUiOiJpbnRlcm5hbCIsImFjY291bnRfbmFtZSI6ImFkbWluIiwiY29tbW9uX25hbWUiOiJBZG1pbiIsInVzZXJfdHlwZSI6IklOVEVSTkFMIiwicm9sZXMiOlsiQURNSU4iXSwiZW1haWwiOiIiLCJzdXBlcl91c2VyIjp0cnVlLCJyZWFkX29ubHkiOmZhbHNlLCJzZW5kX3JlcG9ydCI6ZmFsc2V9.O2s4a1pytEOWc_dTixrMaXLra9SehassdV4n1WNdl5Q",
          access_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBY2Nlc3MiLCJpc3MiOiJiYWNrZW5kIiwiaWF0IjoxNjc2MjA1MTAwLCJleHAiOjE2NzYyMDg3MDAsImp0aSI6Ijc0MWM0MjE3LWE2NDItNDU1Ni05YTRmLWYwYjAwNGVlNzFlNiIsInJlZnJlc2hfaWQiOiJkNWVjZmZkZC0wODc1LTRiNGEtOTE1NC1kMTMxZWY3YjQyYjIiLCJkb21haW5fbmFtZSI6ImludGVybmFsIiwiYWNjb3VudF9uYW1lIjoiYWRtaW4iLCJjb21tb25fbmFtZSI6IkFkbWluIiwidXNlcl90eXBlIjoiSU5URVJOQUwiLCJyb2xlcyI6WyJBRE1JTiJdLCJlbWFpbCI6IiIsInN1cGVyX3VzZXIiOnRydWUsInJlYWRfb25seSI6ZmFsc2UsInNlbmRfcmVwb3J0IjpmYWxzZX0.QqApEueIjv7xvG5-SzksO3VjgcW63hl5dqF64OTvxU0",
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
