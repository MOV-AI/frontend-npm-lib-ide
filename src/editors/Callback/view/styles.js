import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const menuStyles = makeStyles(_theme => ({
  itemValue: {
    padding: "15px 15px 15px 25px",
    fontSize: "14px"
  },
  itemLibValue: {
    paddingLeft: "10px",
    "& span": {
      fontSize: "14px"
    }
  },
  disabled: {
    color: "gray"
  }
}));
