import React, { useCallback } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import IconButton from "@mui/material/IconButton";
import { Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getIconByScope } from "../../../utils/Utils";

import { homeTabLinkStyles } from "../styles";

function HomeLink(props) {
  const { doc, openRecentDocument, removeRecentDocument } = props;
  const { id, scope, name, isDeleted } = doc;
  const classes = homeTabLinkStyles();
  const rowClasses = isDeleted ? [classes.row, classes.deleted] : classes.row;

  const handleOpenDocument = useCallback(
    () => openRecentDocument(doc),
    [doc, openRecentDocument]
  );

  const handleDeleteDocument = useCallback(
    e => {
      removeRecentDocument(id);
      e.stopPropagation();
    },
    [id, removeRecentDocument]
  );

  return (
    <Tooltip
      arrow
      title={i18n.t("OpenDocUrl", { docUrl: props.doc.url })}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      placement="right-start"
    >
      <div
        data-testid="input_open-document"
        className={rowClasses}
        onClick={handleOpenDocument}
      >
        <Tooltip title={id}>
          <div className={classes.iconLink}>
            {getIconByScope(scope)}
            <span href="#" underline="none" className={classes.link}>
              {name}
            </span>
          </div>
        </Tooltip>
        <div>
          <Tooltip title={i18n.t("Remove")}>
            <IconButton
              onClick={handleDeleteDocument}
              size="small"
              className={classes.deleteDocument}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Tooltip>
  );
}

export default HomeLink;
