import React, { useCallback, useEffect, useState, useRef } from "react";
import { Logs } from "@mov-ai/mov-fe-lib-react";
import { RobotManager } from "@mov-ai/mov-fe-lib-core";
import { withToolPlugin } from "../../../engine";

const LogsTool = () => {
  const robotManager = useRef(new RobotManager());
  const [robots, setRobots] = useState({});

  const updateRobots = useCallback(changedRobots => {
    setRobots(prevState => {
      const newState = {};
      Object.keys(changedRobots).forEach(id => {
        newState[id] = changedRobots[id];
      });
      return { ...prevState, ...newState };
    });
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    const _robotManager = robotManager.current;

    _robotManager.getAll(_robots => setRobots(_robots));
    const subId = _robotManager.subscribeToChanges(updateRobots);

    return () => {
      _robotManager.unsubscribeToChanges(subId);
    };
  }, [updateRobots, robotManager]);

  const formatRobotData = () => {
    const res = [];
    Object.keys(robots).forEach(elem => {
      const id = elem;
      res.push({
        id,
        name: robots?.[id].RobotName,
        ip: robots?.[id].IP
      });
    });
    return res;
  };

  // Render
  return <Logs robotsData={formatRobotData()} advancedMode />;
};

const LogsPlugin = withToolPlugin(LogsTool);

export default LogsPlugin;

export const LOGS_PROFILE = {
  name: "Logs",
  title: "Logs",
  plugin: LogsPlugin
};

export const getLogsToolTab = () => {
  return {
    ...LOGS_PROFILE,
    id: LOGS_PROFILE.name,
    name: LOGS_PROFILE.title,
    tabTitle: LOGS_PROFILE.title,
    scope: LOGS_PROFILE.name,
    extension: ""
  };
};
