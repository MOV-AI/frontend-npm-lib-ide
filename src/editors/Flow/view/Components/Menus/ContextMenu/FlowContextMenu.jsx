import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { ContextMenu } from ".";

const FlowContextMenu = props => {
  const { anchorPosition, options, onClose } = props;

  const generateOptions = useCallback(() => {
    return options?.map(
      opt =>
        opt.onClick && {
          label: i18n.t(opt.label, opt.labelVars),
          icon: opt.icon,
          disabled: opt.disabled,
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
