import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { ContextMenu } from ".";

const FlowContextMenu = props => {
  const { t } = useTranslation();
  const { anchorPosition, onClose, options } = props;

  const generateOptions = useCallback(() => {
    return options?.map(
      opt =>
        opt.onClick && {
          label: t(opt.label),
          icon: opt.icon,
          onClick: e => {
            opt.onClick(e);
            !opt.persist && onClose();
          }
        }
    );
  }, [options]);

  return (
    <ContextMenu
      anchorPosition={anchorPosition}
      menuList={generateOptions()}
      onClose={onClose}
    />
  );
};

FlowContextMenu.defaultProps = {
  anchorPosition: null
};

FlowContextMenu.propTypes = {
  mode: PropTypes.string,
  anchorPosition: PropTypes.object,
  onClose: PropTypes.func.isRequired
};

export default FlowContextMenu;
