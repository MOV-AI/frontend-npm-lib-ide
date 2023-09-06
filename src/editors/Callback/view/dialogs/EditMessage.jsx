import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Typography,
  TextField,
  Dialog,
  DialogContent,
  Button,
  DialogActions
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PLUGINS } from "../../../../utils/Constants";
import { call } from "../../../../utils/noremix";
import { makeSub } from "@tty-pt/sub";
import useSub from "@mov-ai/mov-fe-lib-react/dist/hooks/useSub";
import { ERROR_MESSAGES } from "../../../../utils/Messages";
import { DialogTitle } from "../../../../plugins/Dialog/components/AppDialog/AppDialog";
import Loader from "../../../_shared/Loader/Loader";
import MaterialTree from "../../../_shared/MaterialTree/MaterialTree";
import Search from "../../../_shared/Search/Search";
import { searchMessages } from "./utils";

const useStyles = makeStyles(_theme => ({
  treeRoot: {
    overflowY: "auto",
    overflowX: "hidden",
    paddingLeft: 5,
    justifyContent: "center",
    width: "100%"
  },
  paper: {
    minWidth: "40%"
  }
}));

const messagesSub = makeSub({});
const messagesEmit = messagesSub.makeEmitNow((scope, messages) => ({
  ...messagesSub.data.value,
  [scope]: messages
}));

async function getMessages(scope) {
  const ret = messagesSub.data.value[scope];
  if (ret)
    return ret;

  return await call(
    PLUGINS.DOC_MANAGER.NAME,
    PLUGINS.DOC_MANAGER.CALL.GET_STORE,
    scope
  ).then(store => store.helper.getAllMessages())
    .then(messages => messagesEmit(scope, messages));
}

const EditMessageDialog = props => {
  // Props
  const { open, scope, selectedMessage, onClose, onSubmit } = props;
  // State hooks
  const [loading, setLoading] = useState(false);
  const realMessages = useSub(messagesSub)?.[scope];
  const messages = useMemo(() => Object.keys(realMessages ?? {}).sort((a, b) => (b - a)).map((pack, idx1) => ({
    id: (idx1 + 1) * 100,
    text: pack,
    children: realMessages[pack].sort().map((message, idx2) => ({
      id: (idx1 + 1) * 100 + idx2 + 1,
      text: message,
      isLeaf: true
    })),
  })), [realMessages]);
  const [filteredMsg, setFilteredMsg] = useState(messages);
  const [selectedMsg, setSelectedMsg] = useState(selectedMessage);
  // Style hook
  const classes = useStyles();
  // Translation hook
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * On change selected Message
   * @param {*} selectedMessage
   */
  const onSelectMessage = _selectedMessage => {
    const messagePath = _selectedMessage.split("/");
    if (messagePath.length <= 1) return;
    // Return selectedMessage
    setSelectedMsg(_selectedMessage);
  };

  /**
   * On search tree
   */
  const onSearch = useCallback(
    value => setFilteredMsg(searchMessages(value, messages)),
    [messages]
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
    (async function () {
      setLoading(true);
      await getMessages(scope);
      setLoading(false);
    })()
  }, [scope]);

  useEffect(() => setFilteredMsg(messages), [messages]);

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
        <h2>{t(ERROR_MESSAGES.SOMETHING_WENT_WRONG)}</h2>
        <h3>{t("FailedToLoadMessages")}</h3>
      </>
    );
  };

  return (
    <Dialog
      data-testid="section_edit-message"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle onClose={onClose} hasCloseButton={true}>
        {t("EditMessage")}
      </DialogTitle>
      <DialogContent>
        <Search onSearch={onSearch} />
        <Typography component="div" className={classes.treeRoot}>
          {renderTree()}
        </Typography>
        <TextField
          fullWidth
          label={t("Message")}
          value={selectedMsg}
          margin="normal"
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button data-testid="input_cancel" onClick={onClose}>
          {t("Cancel")}
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
          {t("Submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMessageDialog;
