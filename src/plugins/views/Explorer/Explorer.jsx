import React, { useCallback, useState, useEffect } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { withAlerts } from "../../../decorators";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../utils/Messages";
import { PLUGINS, ALERT_SEVERITIES } from "../../../utils/Constants";
import AppSettings from "../../../App/AppSettings";
import ListItemsTreeWithSearch, {
  toggleExpandRow,
} from "./components/ListItemTree/ListItemsTreeWithSearch";
import { explorerStyles } from "./styles";

const Explorer = (props) => {
  const { call, on, off, alert } = props;
  const classes = explorerStyles();
  const [data, setData] = useState([]);

  // to debug data
  window.ExplorerData = data;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Push element into list in correct position
   * @private function
   * @param {Array} list
   * @param {TreeNode} element
   */
  const pushSorted = useCallback((list, element) => {
    /**
     * Compare objects' name property to sort
     * @param {*} a
     * @param {*} b
     * @returns
     */
    const compareByName = (a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    };
    // Insert element
    list.push(element);
    // Return sorted list
    return list.sort(compareByName).map((x, i) => ({ ...x, id: i }));
  }, []);

  /**
   * Delete document from local list
   * @private function
   * @param {{documentName: String, documentType: String}} docData
   */
  const deleteDocument = useCallback((docData) => {
    const { documentName, documentType } = docData;
    setData((prevState) => {
      const newData = [...prevState];
      // TODO: optimize time
      const typeIndex = newData.findIndex(
        (type) => type.scope === documentType,
      );
      if (typeIndex >= 0) {
        const documentIndex = newData[typeIndex].children.findIndex(
          (doc) => doc.name === documentName,
        );
        if (documentIndex >= 0) {
          newData[typeIndex].children.splice(documentIndex, 1);
        }
      }
      return newData;
    });
  }, []);

  /**
   * Insert newly created document
   * @private function
   * @param {DocManager} docManager
   * @param {{documentName: String, documentType: String}} docData
   */
  const addDocument = useCallback(
    (_, docData) => {
      const { documentName, documentType, document } = docData;
      setData((prevState) => {
        // TODO: optimize time
        const newData = [...prevState];
        const typeIndex = newData.findIndex(
          (type) => type.scope === documentType,
        );
        if (typeIndex >= 0) {
          const documentIndex = newData[typeIndex].children.findIndex(
            (doc) => doc.name === documentName,
          );
          if (documentIndex < 0) {
            pushSorted(newData[typeIndex].children, {
              name: document.getName(),
              title: document.getName(),
              scope: document.getScope(),
              url: document.getUrl(),
            });
          }
        }
        return newData;
      });
    },
    [pushSorted],
  );

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Expand tree or open document depending on have children or not
   * @param {{id: String, deepness: String, url: String, name: String, scope: String}} node : Clicked node
   */
  const requestScopeVersions = useCallback(
    (node) => {
      if (node.children?.length) {
        setData(toggleExpandRow(node, data));
      } else {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: node.url,
          name: node.name,
          scope: node.scope,
        });
      }
    },
    [data, call],
  );

  /**
   * Handle click to copy document
   * @param {{name: string, scope: string}} node : Clicked document node
   */
  const handleCopy = useCallback(
    (node) => {
      const { name, scope } = node;
      return call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.COPY_DOC, {
        scope,
        name,
        onSubmit: (newName) =>
          call(
            PLUGINS.DOC_MANAGER.NAME,
            PLUGINS.DOC_MANAGER.CALL.COPY,
            { name, scope },
            newName,
          )
            .then((copiedDoc) => {
              // Open copied document
              requestScopeVersions({
                scope,
                deepness: 1,
                name: copiedDoc.getName(),
                url: copiedDoc.getUrl(),
              });
            })
            .catch((error) => {
              console.warn(
                `Could not copy ${name} \n ${error.statusText ?? error}`,
              );
              alert({
                message:
                  i18n.t(ERROR_MESSAGES.DOC_COPY, {
                    docName: name,
                  }) +
                  ": " +
                  (error.statusText ?? error),
                severity: ALERT_SEVERITIES.ERROR,
              });
            }),
      });
    },
    [call, requestScopeVersions],
  );

  /**
   * Handle click to delete document
   * @param {{name: string, scope: string}} node : Clicked document node
   */
  const handleDelete = useCallback(
    (node) => {
      const { name, scope } = node;
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        submitText: i18n.t("Delete"),
        title: i18n.t("DeleteDocConfirmationTitle"),
        onSubmit: () =>
          call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.DELETE, {
            name,
            scope,
          })
            .then((res) => {
              console.warn("Debug document deleted", res);
              alert({
                message: i18n.t(SUCCESS_MESSAGES.DOC_DELETE_SUCCESSFULLY, {
                  docName: name,
                }),
                severity: ALERT_SEVERITIES.SUCCESS,
              });
            })
            .catch((error) => {
              console.warn(
                `Could not delete ${name} \n ${error.statusText ?? error}`,
              );
              alert({
                message:
                  i18n.t(ERROR_MESSAGES.DOC_DELETE, {
                    docName: name,
                  }) +
                  ": " +
                  (error.statusText ?? error),
                severity: ALERT_SEVERITIES.ERROR,
              });
            }),
        message: i18n.t("DeleteDocConfirmationMessage", { docName: name }),
      });
    },
    [call],
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Load documents
   * @param {DocManager} docManager
   */
  const loadDocs = useCallback((docManager) => {
    return setData(
      docManager.getStores().map((store, id) => {
        const { name, title, model } = store;
        return {
          id,
          name,
          scope: model.SCOPE || name,
          title,
          children: store.getDocs().map((doc, childId) => {
            return {
              id: childId,
              name: doc.getName(),
              title: doc.getName(),
              scope: doc.getScope(),
              url: doc.getUrl(),
            };
          }),
        };
      }),
    );
  }, []);

  /**
   *
   * @param {DocManager} docManager
   * @param {{action: String, documentName: String, documentType: String}} docData
   */
  const updateDocs = useCallback(
    (docManager, docData) => {
      const { action } = docData;
      const updateByActionMap = {
        del: () => deleteDocument(docData),
        set: () => addDocument(docManager, docData),
      };
      updateByActionMap[action] && updateByActionMap[action]();
    },
    [deleteDocument, addDocument],
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    // Ugly but needed to compensate for what we believe to be a bug on the
    // Remixproject library. The on function is being called on mount with
    // Previously used data.
    let mounting = true;
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS, loadDocs);
    on(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.ON.UPDATE_DOCS,
      updateDocs,
    );
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC, (data) => {
      if (mounting) return;
      deleteDocument({ documentName: data.name, documentType: data.scope });
    });

    mounting = false;

    return () => {
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.UPDATE_DOCS);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC);
    };
  }, [on, loadDocs, updateDocs]);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================
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
            call={call}
            onClickNode={requestScopeVersions}
            handleCopyClick={handleCopy}
            handleDeleteClick={handleDelete}
            showIcons={true}
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
};
