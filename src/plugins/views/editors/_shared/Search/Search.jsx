import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, InputAdornment } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";

/**
 * Normalize string
 * @param {*} str
 * @returns
 */
const normalizeString = str => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/**
 *
 * @param {*} searchQuery
 * @param {*} subject
 * @returns
 */
const filter = (searchQuery, subject) => {
  // Normalize search query
  searchQuery = normalizeString(searchQuery);

  /**
   * Search in numbers and booleans
   * @returns {boolean} True if searchQuery is found in stringified subject
   */
  const searchNonStrings = () => {
    subject = normalizeString(subject.toString());
    return subject.includes(searchQuery);
  };

  switch (typeof subject) {
    case DATA_TYPES.STRING:
      subject = normalizeString(subject);
      return subject.includes(searchQuery);

    case DATA_TYPES.OBJECT:
      // Is array
      if (Array.isArray(subject)) {
        subject = subject.filter(e => {
          var value = filter(searchQuery, e);
          if (typeof value !== DATA_TYPES.BOOLEAN) {
            if (value !== undefined) {
              value = value.length === 0 ? false : true;
            }
          }
          return value;
        });
        return subject;
      }
      // Is an object
      else {
        let values = Object.values(subject || {});
        let list = filter(searchQuery, values);
        return list.length > 0 ? subject : false;
      }

    case DATA_TYPES.NUMBER:
      return searchNonStrings();
    case DATA_TYPES.BOOLEAN:
      return searchNonStrings();

    default:
      return subject;
  }
};

const Search = props => {
  const { onSearch } = props;

  return (
    <TextField
      fullWidth
      placeholder="Search"
      defaultValue={""}
      onChange={event => {
        const value = event.target.value;
        onSearch(value);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        )
      }}
    />
  );
};

export default Search;
export { filter };
