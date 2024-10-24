import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";

import PropertyItem from "./PropertyItem";

const PropertiesSection = ({
  editable,
  onChangeProperties,
  templateData,
  nodeInstance,
}) => {
  const properties = useMemo(
    () => ({
      persistent: {
        title: i18n.t("Persistent"),
        options: [
          { text: i18n.t("IsPersistent"), value: true },
          { text: i18n.t("NotPersistent"), value: false },
        ],
      },
      remappable: {
        title: i18n.t("Remappable"),
        options: [
          { text: i18n.t("IsRemappable"), value: true },
          { text: i18n.t("NotRemappable"), value: false },
        ],
      },
      launch: {
        title: i18n.t("Launch"),
        options: [
          { text: i18n.t("ToLaunch"), value: true },
          { text: i18n.t("NotToLaunch"), value: false },
        ],
      },
    }),
    [],
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return Object.entries(properties).map(([key, item]) => (
    <PropertyItem
      key={"properties-item-" + key}
      title={item.title}
      options={item.options}
      name={key}
      value={nodeInstance[key]}
      templateValue={templateData[key]}
      editable={editable}
      onChangeProperties={onChangeProperties}
    />
  ));
};

PropertiesSection.propTypes = {
  templateData: PropTypes.object.isRequired,
  nodeInstance: PropTypes.object.isRequired,
  onChangeProperties: PropTypes.func.isRequired,
  editable: PropTypes.bool,
};

PropertiesSection.defaultProps = {
  editable: false,
};

export default PropertiesSection;
