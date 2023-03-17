import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Divider, List, ListItem } from "@material-ui/core";
import Search from "../../../../../utils/components/Search/Search";
import VirtualizedTree from "../VirtualizedTree/VirtualizedTree";

import { listItemsTreeWithSearchStyles } from "./styles";
import ItemRow from "./ItemRow";

export function toggleExpandRow(node, data) {
  // Toggle the expansion of the clicked panel«
  const isExpanded = data[node.scope]?.expanded ?? false;
  return {
    ...Object.values(data).reduce((a, store) => ({
      ...a,
      [store.scope]: {
        ...store,
        expanded: false,
      }
    }), {}),

    [node.scope]: {
      ...data[node.scope],
      expanded: !isExpanded,
    }
  };
}

function transform(data) {
  return Object.values(data).reduce((a, store) => {
    const ret = a.concat([store]);

    if (store.expanded)
      return ret.concat(Object.values(store.children));

    return ret;
  }, []);
}

const ListItemsTreeWithSearch = props => {
  const { data } = props;

  // State hooks
  const [itemData, setItemData] = useState(transform(data));
  const [searchInput, setSearchInput] = useState("");

  // Style hook
  const classes = listItemsTreeWithSearchStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Filters given array of data
   * @param {Array} searchData : data that we want to filter from
   * @param {String} value : string to filter by
   * @return {Array} filtered array
   */
  const searchFilter = useCallback((value = "") => {
    const valueLower = value.toLowerCase();
    const rawMap = Object.entries(data).reduce((a, [key, store]) => {
      const childrenArr = Object.entries(store.children)
        .filter(entry => entry[1].name.toLowerCase().includes(valueLower));

      if (!childrenArr.length)
        return searchData;
        

      return ({
        ...a,
        [key]: {
          ...store,
          children: {
            ...childrenArr.reduce((a, entry) => ({
              ...a,
              [entry[0]]: entry[1],
            }), {})
          },
        },
      });
    }, {});

    setItemData(transform(rawMap));
  }, [data, setItemData]);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Search handler
   * @param {String} searchValue : String used to search
   */
  const handleOnSearch = useCallback(searchValue => {
    setSearchInput(searchValue);
    searchFilter(searchValue);
  }, [searchFilter, setSearchInput]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Will trigger mostly when data changes
   */
  useEffect(() => {
    searchFilter(searchInput);
  }, [searchInput, searchFilter]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Row render function
   * @param {*} rowProps
   * @returns {JSX<ItemRow>} To be rendered
   */
  const renderRow = rowProps => {
    const { index, style, data: rowData } = rowProps;
    const node = rowData[index];

    return <ItemRow node={node} {...props} style={style} />;
  };

  return (
    <List className={classes.list} dense={true} component="div">
      <ListItem className={classes.searchHolder} component="div">
        <Search onSearch={handleOnSearch} />
      </ListItem>
      <Divider />
      <div className={classes.listHolder}>
        <VirtualizedTree itemData={itemData} rowRender={renderRow} />
      </div>
    </List>
  );
};

ListItemsTreeWithSearch.propTypes = {
  data: PropTypes.array.isRequired
};

export default ListItemsTreeWithSearch;
