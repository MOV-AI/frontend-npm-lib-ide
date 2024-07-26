import React, { useCallback, useEffect, useRef } from "react";
import { DOCK_POSITIONS } from "../../../../utils/Constants";
import { runBeforeUnload } from "../../../../utils/Utils";

const useTabStack = (workspaceManager, layout) => {
  const tabStack = useRef({});

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Remove all untitled tabs (not created in Redis)
   */
  const removeNewTabsFromStack = useCallback(() => {
    const thisStack = tabStack.current;
    const newStack = {};
    for (const dock in thisStack) {
      const dockStack = thisStack[dock];
      newStack[dock] = dockStack.filter(tab => !tab?.isNew);
    }
    workspaceManager.setTabStack(newStack);
  }, [workspaceManager]);

  /**
   * @private Sanitizes all tabs in docks 
   * (What would happen sometimes is: For some reason
   * You could have multiple tabs in the tab stack 
   * that didn't actually exist in the layout,
   * This way, on mount we will always sanitize the tabStack
   * to only have the same tabs that exist in the layout)
   */
  const sanitizeStackTabs = useCallback(() => {
    if(!layout) return;
    // const dockboxTabs = layout.dockbox.children[0]?.tabs;
    // const floatboxTabs = layout.floatbox.children[0]?.tabs;
    // const maxboxTabs = layout.maxbox.children[0]?.tabs;
    // const windowboxTabs = layout.windowbox.children[0]?.tabs;

    Object.keys(tabStack.current).forEach(key => {
      tabStack.current[key] = layout[key].children[0]?.tabs.map(actualTab => {
        tabStack.current[key].find(stackTab => stackTab.id === actualTab.id);
      })
    })
    // tabStack.current.dockbox = dockboxTabs?.map(actualTab => 
    //   tabStack.current.dockbox.find(stackTab => stackTab.id === actualTab.id)
    // );
    // tabStack.current.floatbox = floatboxTabs?.map(actualTab => 
    //   tabStack.current.floatbox.find(stackTab => stackTab.id === actualTab.id)
    // );
    // tabStack.current.maxbox = maxboxTabs?.map(actualTab => 
    //   tabStack.current.maxbox.find(stackTab => stackTab.id === actualTab.id)
    // );
    // tabStack.current.windowbox = windowboxTabs?.map(actualTab => 
    //   tabStack.current.windowbox.find(stackTab => stackTab.id === actualTab.id)
    // );

  }, [layout])

  //========================================================================================
  /*                                                                                      *
   *                                    Public Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Removes a tab from the stack for given dock
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to remove from the stack
   */
  const removeTabFromStack = useCallback(
    (tabId, dock = DOCK_POSITIONS.DOCK) => {
      const thisStack = tabStack.current[dock] || [];
      const newStack = thisStack.filter(tab => tab?.id !== tabId);
      tabStack.current[dock] = newStack;
      workspaceManager.setTabStack(tabStack.current);
    },
    [workspaceManager]
  );

  /**
   * Adds a tab to the stack of given dock
   * @param {String} dock : the dock to look for the tab, defaults to 'dockbox'
   * @param {String} tabId : the tabId to add to the stack
   */
  const addTabToStack = useCallback(
    (tabData, dock = DOCK_POSITIONS.DOCK) => {
      const { id, isNew } = tabData;
      removeTabFromStack(id, dock);
      const thisStack = tabStack.current[dock] || [];

      thisStack.push({ id, isNew });
      tabStack.current[dock] = thisStack;
      workspaceManager.setTabStack(tabStack.current);
    },
    [workspaceManager, removeTabFromStack]
  );
  
  /**
   * Get next tab from stack
   */
  const getNextTabFromStack = useCallback((dock = DOCK_POSITIONS.DOCK) => {
    let thisStack = tabStack.current[dock] || [];
    return thisStack[thisStack.length - 1]?.id;
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    tabStack.current = workspaceManager.getTabStack();
    // Let's sanitize the stacktabs on mount 
    sanitizeStackTabs();
    // Before unload app, remove all "untitled" tabs from stack
    runBeforeUnload(removeNewTabsFromStack);
  }, [workspaceManager, removeNewTabsFromStack]);

  //========================================================================================
  /*                                                                                      *
   *                             Return Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  return {
    addTabToStack,
    removeTabFromStack,
    getNextTabFromStack
  };
};

export default useTabStack;
