import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { withAlerts } from "../../../decorators";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { SUCCESS_MESSAGES } from "../../../utils/Messages";
import { PLUGINS, ALERT_SEVERITIES } from "../../../utils/Constants";
import AppSettings from "../../../App/AppSettings";
import ListItemsTreeWithSearch, {
  toggleExpandRow
} from "./components/ListItemTree/ListItemsTreeWithSearch";
import { explorerStyles } from "./styles";

Function.prototype.use = function (...preArgs) {
  return useCallback(
    (...args) => this.apply(null, preArgs.concat(args)),
    preArgs
  );
};

function useDocManager(on, off, cb) {
  const [ docManager, setDocManager ] = useState(null);

  useEffect(() => {
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS, docManager => {
      setDocManager(docManager);
      cb && cb(docManager);
    });
    return () => off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS);
  }, []);

  return docManager;
}

/**
 * Push element into list in correct position
 * @private function
 * @param {Array} list
 * @param {TreeNode} element
 */
function pushSorted(list, element) {
  return list.concat([element]).sort(
    (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  ).map((x, id) => ({ ...x, id }));
}

// return updated store data (to use with setData)
function storeData(data, docManager) {
  if (data.length)
    return data;

  return docManager.getStores().map((store, id) => {
    const { name, title, model } = store;
    return {
      id,
      name,
      scope: model.SCOPE || name,
      state: {},
      // state: (data[id] || { state: {} }).state,
      title,
      children: store.getDocs().map((doc, childId) => {
        return {
          id: childId,
          name: doc.getName(),
          title: doc.getName(),
          scope: doc.getScope(),
          url: doc.getUrl()
        };
      })
    };
  });
}

function openEditor(call, config) {
  return call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, config);
}

// modify child of data item
function modify(dataState, docManager, docData, update) {
  const [ data, setData ] = dataState;
  const { documentName, documentType, document } = docData;
  const sdata = storeData(data, docManager);
  const typeIndex = sdata.findIndex(type => type.scope === documentType);

  if (typeIndex >= 0) {
    const documentIndex = sdata[typeIndex].children.findIndex(
      doc => doc.name === documentName
    );

    const modified = update(sdata[typeIndex].children, documentIndex, document);

    if (modified !== null) {
      let newData = [ ...sdata ];
      newData[typeIndex] = {
        ...newData[typeIndex],
        children: modified,
      };
      setData(newData);
      return;
    }
  }

  if (!data.length)
    setData(sdata);
}

/**
 * Insert newly created document
 * @private function
 * @param {DocManager} docManager
 * @param {{documentName: String, documentType: String}} docData
 */
function addDocument(dataState, docManager, docData) {
  modify(dataState, docManager, docData, function (typeArr, index, document) {
    if (index >= 0)
      return null;

    else return pushSorted(typeArr, {
      name: document.getName(),
      title: document.getName(),
      scope: document.getScope(),
      url: document.getUrl()
    });
  });
}

/**
 * Delete document from local list
 * @private function
 * @param {{documentName: String, documentType: String}} docData
 */
function deleteDocument(dataState, docManager, docData) {
  modify(dataState, docManager, docData, function (typeArr, index) {
    if (index < 0)
      return null;
    else {
      const newTypeArr = [ ...typeArr ];
      newTypeArr.splice(index, 1);
      return newTypeArr;
    }
  });
}

/**
 * Handle click to copy document
 * @param {{name: string, scope: string}} node : Clicked document node
 */
function handleCopy(dataState, docManager, call, node) {
  const { name, scope } = node;

  call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.COPY_DOC, {
    scope,
    name,
    onSubmit: newName => call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.COPY,
      { name, scope },
      newName
    ).then(copiedDoc => {
      const name = copiedDoc.getName();

      openEditor(call, {
        id: copiedDoc.getUrl(),
        scope,
        name,
      });

      addDocument(dataState, docManager, {
        documentName: name,
        documentType: scope,
        document: copiedDoc,
      });
    })
  });
}

/**
 * Handle click to delete document
 * @param {{name: string, scope: string}} node : Clicked document node
 */
function handleDelete(dataState, docManager, call, t, alert, node) {
  const { name, scope } = node;

  call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
    submitText: t("Delete"),
    title: t("DeleteDocConfirmationTitle"),
    onSubmit: () =>
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.DELETE, {
        name,
        scope
      }).then(res => {
        console.warn("Debug document deleted", res);
        alert({
          message: t(SUCCESS_MESSAGES.DOC_DELETE_SUCCESSFULLY, {
            docName: name
          }),
          severity: ALERT_SEVERITIES.SUCCESS
        });
        deleteDocument(dataState, docManager, {
          documentName: name,
          documentType: scope,
        });
      }).catch(error =>
        console.warn(
          `Could not delete ${name} \n ${error.statusText ?? error}`
        )
      ),
    message: t("DeleteDocConfirmationMessage", { docName: name })
  });
}

function handleClickNode(dataState, call, node) {
  const [ data, setData ] = dataState;

  if (node.children)
    setData(toggleExpandRow(node, data));

  else {
    const { name, scope } = node;
    openEditor(call, { id: node.url, name, scope });
  }
}

function _onUpdate(dataState, docManager, docData) {
  return ({
    del: deleteDocument,
    set: addDocument,
  })[docData.action](dataState, docManager, docData);
}

const Explorer = props => {
  const { call, on, off, alert } = props;
  const classes = explorerStyles();
  const dataState = useState([]);
  const [data, setData] = dataState;
  const docManager = useDocManager(on, off,
    docManager => setData(storeData([], docManager))
  );

  window.ExplorerData = data;

  const { t } = useTranslation();

  const onUpdate = _onUpdate.use(dataState, docManager);

  useEffect(() => {
    if (!docManager)
      return;

    docManager.addEventListener("update", onUpdate);
    return () => docManager.removeEventListener("update", onUpdate);
  }, [docManager, onUpdate]);

  return (
    <>
      <h1 className={classes.header}>
        <img src={AppSettings.LOGO} alt={AppSettings.APP_INFORMATION.LABEL} />
      </h1>
      <Typography
        data-testid="section_explorer"
        component="div"
        className={classes.typography}
      >
        {data && (
          <ListItemsTreeWithSearch
            data={data}
            onClickNode={handleClickNode.use(dataState, call)}
            handleCopyClick={handleCopy.use(dataState, docManager, call)}
            handleDeleteClick={handleDelete.use(dataState, docManager, call, t, alert)}
            showIcons
          ></ListItemsTreeWithSearch>
        )}
      </Typography>
    </>
  );
};

export default withViewPlugin(withAlerts(Explorer));

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  off: PropTypes.func.isRequired
};
