import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { cloneDeep } from "lodash";
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

const Explorer = props => {
  const { dependencies, call, on, off, alert } = props;
  const docMan = dependencies.docMan;
  const classes = explorerStyles();
  const [data, setData] = useState({});
  const [registered, setRegistered] = useState({});

  // to debug data
  window.ExplorerData = data;

  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Delete document from local list
   * @private function
   * @param {{documentName: String, documentType: String}} docData
   */
  const deleteDocument = useCallback(docData => {
    const { documentName, documentType } = docData;
    setData(prevState => {
      const newState = cloneDeep(prevState);
      delete newState[documentType].children[documentName];
      return newState;
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
      const { documentName, documentType } = docData;
      const document = docData.document ?? docMan.load({
        workspace: "global",
        scope: documentType,
        name: documentName,
      });
      setData(prevState => {
        return {
          ...prevState,
          [documentType]: {
            ...prevState[documentType],
            children: {
              ...prevState[documentType].children,
              [documentName]: {
                name: document.name ?? document.getName(),
                title: document.name ?? document.getName(),
                scope: document.scope ?? document.getScope(),
                url: document.url ?? document.getUrl()
              },
            }
          },
        };
      });
    },
    []
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
    node => {
      if (node.children) {
        setData(data => toggleExpandRow(node, data));
      } else {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: node.url,
          name: node.name,
          scope: node.scope
        });
      }
    },
    [call]
  );

  /**
   * Handle click to copy document
   * @param {{name: string, scope: string}} node : Clicked document node
   */
  const handleCopy = useCallback(
    node => {
      const { name, scope } = node;
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.COPY_DOC, {
        scope,
        name,
        onSubmit: newName =>
          new Promise(resolve => {
            call(
              PLUGINS.DOC_MANAGER.NAME,
              PLUGINS.DOC_MANAGER.CALL.COPY,
              { name, scope },
              newName
            ).then(copiedDoc => {
              resolve();
              // Open copied document
              requestScopeVersions({
                scope,
                deepness: 1,
                name: copiedDoc.name ?? copiedDoc.getName(),
                url: copiedDoc.url ?? copiedDoc.getUrl()
              });
            });
          })
      });
    },
    [call, requestScopeVersions]
  );

  /**
   * Handle click to delete document
   * @param {{name: string, scope: string}} node : Clicked document node
   */
  const handleDelete = useCallback(
    node => {
      const { name, scope } = node;
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        submitText: t("Delete"),
        title: t("DeleteDocConfirmationTitle"),
        onSubmit: () =>
          call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.DELETE, {
            name,
            scope
          })
            .then(res => {
              console.warn("Debug document deleted", res);
              alert({
                message: t(SUCCESS_MESSAGES.DOC_DELETE_SUCCESSFULLY, {
                  docName: name
                }),
                severity: ALERT_SEVERITIES.SUCCESS
              });
            })
            .catch(error =>
              console.warn(
                `Could not delete ${name} \n ${error.statusText ?? error}`
              )
            ),
        message: t("DeleteDocConfirmationMessage", { docName: name })
      });
    },
    [call, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Load document
   * @param DocumentEx docManager
   */
  const loadDoc = useCallback(doc => {
    console.log("Explorer.loadDoc", doc);
    const [url, scope, name] = doc.url ? [
      doc.url,
      doc.scope,
      doc.name,
    ] : [
      doc.getUrl(),
      doc.getScope(),
      doc.getName(),
    ];

    if (registered[url])
      return;

    const store = data[scope] ?? {
      id: scope,
      name: scope,
      scope: scope,
      title: scope,
      children: {},
    };

    setData({
      ...data,
      [scope]: {
        ...store,
        children: {
          ...store.children,
          [name]: {
            id: name,
            name,
            title: name,
            scope,
            url,
          },
        },
      }
    });
    setRegistered({ ...registered, [url]: true });
  }, [data, setData, registered, setRegistered]);

  /**
   * Load documents
   * @param {DocManager} docManager
   */
  const loadDocs = useCallback(
    docManager => docManager.getStores().forEach(store => store.getDocs().forEach(doc => loadDoc(doc)))
  , [loadDoc]);

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
        set: () => addDocument(docManager, docData)
      };
      updateByActionMap[action] && updateByActionMap[action]();
    },
    [deleteDocument, addDocument]
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
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOC, loadDoc);
    on(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.ON.UPDATE_DOCS,
      updateDocs
    );
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC, data => {
      if (mounting) return;
      deleteDocument({ documentName: data.name, documentType: data.scope });
    });

    mounting = false;

    return () => {
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOC); // FIXME how does "off" know how to unsubscribe this specific callback
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
  on: PropTypes.func.isRequired
};
