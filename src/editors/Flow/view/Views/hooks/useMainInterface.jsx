import { useEffect, useMemo } from "react";
import MainInterface from "../../Components/interface/MainInterface";

const useMainInterface = (props, deps = []) => {
  const mi = useMemo(() => new MainInterface({
    ...props,
    id: props.name,
    modelView: props.instance,
  }), deps);

  useEffect(() => {
    return () => mi.destroy();
  }, deps.concat([mi]));

  return { mainInterface: mi };
};

export default useMainInterface;
