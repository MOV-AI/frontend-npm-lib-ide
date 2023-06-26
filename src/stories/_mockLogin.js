// Please update the access and refresh token before start your developments
export const authParams = {
  mockData: [
    {
      url: "/token-auth/",
      method: "POST",
      status: 200,
      response: () => {
        // MUST BE A REAL TOKEN FROM MOVAI BE
        return {
          refresh_token: "",
          access_token: "",
          error: false
        };
      }
    },
    {
      url: "/token-refresh/",
      method: "POST",
      status: 200,
      response: () => {
        return {
          access_token: ""
        };
      }
    },
    {
      url: "/token-verify/",
      method: "POST",
      status: 200,
      response: () => {
        return {
          result: true
        };
      }
    },
    {
      url: "/domains/",
      method: "GET",
      status: 200,
      response: () => {
        return {
          domains: ["internal"]
        };
      }
    }
  ]
};
