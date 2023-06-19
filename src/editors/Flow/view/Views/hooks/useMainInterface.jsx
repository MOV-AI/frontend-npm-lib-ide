import { useEffect, useRef, useMemo, useState } from "react";
import MainInterface from "../../Components/interface/MainInterface";

const useMainInterface = (props, deps = []) => {
  const mi = useMemo(() => new MainInterface({
    ...props,
    id: props.name,
    modelView: props.instance,
  }), deps);

  useEffect(() => {
    return () => mi.destroy();
  }, [mi]);

  return { mainInterface: mi };
};

export default useMainInterface;
