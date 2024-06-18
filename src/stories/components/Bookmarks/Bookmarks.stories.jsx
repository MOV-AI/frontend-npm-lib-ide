import React, { useEffect } from "react";
import AppCE from "../../AppCE";
import { installTool } from "../../../App/BaseApp";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import BookmarkManager, {
  BOOKMARKS_PROFILE,
  getTabData
} from "./BookmarkManager";

const BookmarkManagerStory = props => {
  useEffect(() => {
    installTool({
      id: BOOKMARKS_PROFILE.name,
      profile: BOOKMARKS_PROFILE,
      Plugin: BookmarkManager,
      tabData: getTabData(),
      icon: BookmarkIcon,
      quickAccess: true,
      toolBar: true,
      mainMenu: true
    });
  }, []);

  return <AppCE {...props} />;
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Bookmark Manager",
  component: BookmarkManagerStory
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => <BookmarkManagerStory {...args} />;

export const Bookmarks = Template.bind({});