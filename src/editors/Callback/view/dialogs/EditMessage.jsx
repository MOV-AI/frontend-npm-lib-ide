import React, { useCallback, useEffect, useState } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import {
  Typography,
  TextField,
  Dialog,
  DialogContent,
  Button,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { PLUGINS } from "../../../../utils/Constants";
import { ERROR_MESSAGES } from "../../../../utils/Messages";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import ApplicationTheme from "../../../../themes";
import { DialogTitle } from "../../../../plugins/Dialog/components/AppDialog/AppDialog";
import Loader from "../../../_shared/Loader/Loader";
import MaterialTree from "../../../_shared/MaterialTree/MaterialTree";
import Search from "../../../_shared/Search/Search";
import { searchMessages } from "./utils";

const useStyles = makeStyles((_theme) => ({
  treeRoot: {
    overflowY: "auto",
    overflowX: "hidden",
    paddingLeft: 5,
    justifyContent: "center",
    width: "100%",
  },
  paper: {
    minWidth: "40%",
  },
}));

const EditMessageDialog = (props) => {
  // Props
  const { call, scope, selectedMessage, onClose, onSubmit } = props;
  // State hooks
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState();
  const [filteredMsg, setFilteredMsg] = useState();
  const [selectedMsg, setSelectedMsg] = useState(selectedMessage);
  // Style hook
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                  Private Methods                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Format message list to tree structure
   */
  const _updateMessages = useCallback((list) => {
    let messagesStruct = [];
    Object.keys(list)
      .sort()
      .forEach((pack, idx1) => {
        messagesStruct.push({
          id: (idx1 + 1) * 100,
          text: pack,
          children: list[pack].sort().map((message, idx2) => {
            return {
              id: (idx1 + 1) * 100 + idx2 + 1,
              text: message,
              isLeaf: true,
            };
          }),
        });
      });
    // TODO : If create a CB from NodeEditor append the corresponding Message
    setMessages(messagesStruct);
    setFilteredMsg(messagesStruct);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * On change selected Message
   * @param {*} selectedMessage
   */
  const onSelectMessage = (_selectedMessage) => {
    const messagePath = _selectedMessage.split("/");
    if (messagePath.length <= 1) return;
    // Return selectedMessage
    setSelectedMsg(_selectedMessage);
  };

  /**
   * On search tree
   */
  const onSearch = useCallback(
    (value) => {
      const result = searchMessages(value, messages);
      setFilteredMsg(result);
    },
    [messages],
  );

  //========================================================================================
  /*                                                                                      *
   *                                  React Lifecycle                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Component mounted
   */
  useEffect(() => {
    setLoading(true);
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      scope,
    ).then((store) => {
      store.helper.getAllMessages().then((msgs) => {
        if (msgs) _updateMessages(msgs);
        setLoading(false);
      });
    });
  }, [call, scope, _updateMessages]);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Material Tree to select python lib
   * @returns {ReactElement}
   */
  const renderTree = () => {
    // Return loader if data is not ready
    if (loading) return <Loader />;
    // Return when data is ready or error message if not
    return messages ? (
      <MaterialTree
        data={filteredMsg}
        onNodeSelect={onSelectMessage}
      ></MaterialTree>
    ) : (
      <>
        <h2>{i18n.t(ERROR_MESSAGES.SOMETHING_WENT_WRONG)}</h2>
        <h3>{i18n.t("FailedToLoadMessages")}</h3>
      </>
    );
  };

  return (
    <Dialog
      data-testid="section_edit-message"
      open={true}
      onClose={onClose}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle onClose={onClose} hasCloseButton={true}>
        {i18n.t("EditMessage")}
      </DialogTitle>
      <DialogContent>
        <Search onSearch={onSearch} />
        <Typography component="div" className={classes.treeRoot}>
          {renderTree()}
        </Typography>
        <TextField
          fullWidth
          label={i18n.t("Message")}
          value={selectedMsg}
          margin="normal"
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button data-testid="input_cancel" onClick={onClose}>
          {i18n.t("Cancel")}
        </Button>
        <Button
          data-testid="input_confirm"
          color="primary"
          onClick={() => {
            onSubmit(selectedMsg);
            onClose();
          }}
          disabled={!selectedMsg}
        >
          {i18n.t("Submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTheme(EditMessageDialog, ApplicationTheme);
