import React, { useCallback, useState } from "react";
import { t } from "../../../../../i18n/i18n";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { LINK_DEPENDENCY } from "../../../../../utils/Constants";
import { convertToValidString } from "../../../../../utils/Utils";

import { dependencyInfoStyles } from "./styles";

const DependencyInfo = props => {
  const [minified, setMinified] = useState(false);

  const { activateKeyBind } = props;

  // Style hook
  const classes = dependencyInfoStyles();

  const toggleMinify = useCallback(() => {
    setMinified(prevState => !prevState);
    activateKeyBind();
  }, []);

  return (
    <Card
      data-testid="section_dependency-info"
      className={`${classes.root} ${minified ? "minified" : ""}`}
    >
      <CardContent data-testid="input_minify-toggle" onClick={toggleMinify}>
        <h3>
          {minified
            ? t("MinifiedDependencyInfoTitle")
            : t("DependencyInfoTitle")}
          <ArrowDropDownIcon />
        </h3>
        {Object.values(LINK_DEPENDENCY).map(dep => {
          return (
            <div
              key={convertToValidString(dep.LABEL)}
              className={classes.infoContainer}
            >
              <p>{t(dep.LABEL)}</p>
              <div
                className={classes.colorChip}
                style={{ backgroundColor: dep.COLOR }}
              ></div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DependencyInfo;
