import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import _debounce from "lodash/debounce";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  Button,
  DialogActions
} from "@material-ui/core";
import { PLUGINS } from "../../../../utils/Constants";
import { call, easySub, useSub } from "../../../../utils/noremix";
import { withTheme } from "../../../../decorators/withTheme";
import { DialogTitle } from "../../../../plugins/Dialog/components/AppDialog/AppDialog";
import Loader from "../../../_shared/Loader/Loader";
import MaterialTree from "../../../_shared/MaterialTree/MaterialTree";
import Search from "../../../_shared/Search/Search";
import { EXCLUDED_PATHS, searchImports } from "./utils";
import { ERROR_MESSAGES } from "../../../../utils/Messages";

const useStyles = makeStyles(_theme => ({
  paper: {
    minWidth: "40%"
  }
}));

const libsSub = easySub({});
const libsEmit = libsSub.easyEmit((scope, libs) => ({
  ...libsSub.data.value,
  [scope]: libs
}));

async function getLibs(scope) {
  const ret = libsSub.data.value[scope];
  if (ret)
    return ret;

  return await call(
    PLUGINS.DOC_MANAGER.NAME,
    PLUGINS.DOC_MANAGER.CALL.GET_STORE,
    scope
  ).then(store => store.helper.getAllLibraries())
    .then(libs => libsEmit(scope, libs));
}

const AddImportDialog = props => {
  // Props
  const { open, scope, onClose, onSubmit } = props;
  // State hooks
  const [loading, setLoading] = useState(false);
  const libs = useSub(libsSub)?.[scope];
  const [filteredLibs, setFilteredLibs] = useState(libs);
  const [selectedLibs, setSelectedLibs] = useState();
  // Style hook
  const classes = useStyles();
  // Translation hook
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                  React Lifecycle                                     *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    (async function () {
      setLoading(true);
      await getLibs(scope);
      setLoading(false);
    })();
  }, [scope]);

  useEffect(() => setFilteredLibs(libs), [libs]);

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * On chage selected Lib
   * @param {*} _selectedLibs
   */
  const onSelectLib = _selectedLibs => {
    const pyLibSelected = {};
    _selectedLibs.forEach(libPath => {
      const path = libPath.split(".");
      const modulePath = path.filter(_path => !EXCLUDED_PATHS.includes(_path));
      const name = modulePath.pop();
      if (name === libPath || modulePath.length === 0) {
        pyLibSelected[name] = { module: name, libClass: false };
      } else {
        pyLibSelected[name] = { module: modulePath.join("."), libClass: name };
      }
    });
    // Return pyLibSelected
    setSelectedLibs(pyLibSelected);
  };

  /**
   * On search imports
   * @param {*} value
   */
  const onSearch = _debounce(value => {
    const result = searchImports(value, libs);
    setFilteredLibs(result);
  }, 500);

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
    return libs ? (
      <MaterialTree
        data={filteredLibs}
        onNodeSelect={onSelectLib}
        multiSelect={true}
      ></MaterialTree>
    ) : (
      <>
        <h2>{t(ERROR_MESSAGES.SOMETHING_WENT_WRONG)}</h2>
        <h3>{t("FailedToLoadLibraries")}</h3>
      </>
    );
  };

  return (
    <Dialog
      data-testid="section_add-import-dialog"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle onClose={onClose} hasCloseButton={true}>
        {t("Add Import")}
      </DialogTitle>
      <DialogContent>
        <Search onSearch={onSearch} />
        {renderTree()}
      </DialogContent>
      <DialogActions>
        <Button data-testid="input_cancel" onClick={onClose}>
          {t("Cancel")}
        </Button>
        <Button
          data-testid="input_confirm"
          color="primary"
          onClick={e => {
            onSubmit(selectedLibs);
            onClose(e);
          }}
          disabled={!selectedLibs}
        >
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTheme(AddImportDialog);
