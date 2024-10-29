import React, { useCallback, useState } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Card, CardContent } from "@mov-ai/mov-fe-lib-react";
import { ArrowDropDownIcon } from "@mov-ai/mov-fe-lib-react";
import { LINK_DEPENDENCY } from "../../../../../utils/Constants";
import { convertToValidString } from "../../../../../utils/Utils";

import { dependencyInfoStyles } from "./styles";

const DependencyInfo = (_props) => {
  const [minified, setMinified] = useState(false);

  // Style hook
  const classes = dependencyInfoStyles();

  const toggleMinify = useCallback(() => {
    setMinified((prevState) => !prevState);
  }, []);

  return (
    <Card
      data-testid="section_dependency-info"
      className={`${classes.root} ${minified ? "minified" : ""}`}
    >
      <CardContent data-testid="input_minify-toggle" onClick={toggleMinify}>
        <h3>
          {minified
            ? i18n.t("MinifiedDependencyInfoTitle")
            : i18n.t("DependencyInfoTitle")}
          <ArrowDropDownIcon />
        </h3>
        {Object.values(LINK_DEPENDENCY).map((dep) => {
          return (
            <div
              key={convertToValidString(dep.LABEL)}
              className={classes.infoContainer}
            >
              <p>{i18n.t(dep.LABEL)}</p>
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
