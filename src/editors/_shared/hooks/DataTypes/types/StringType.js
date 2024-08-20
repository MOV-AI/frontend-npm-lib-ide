import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class StringType extends DataType {
  // String type properties definition
  key = DATA_TYPES.STRING;
  label = "String";
  default = '';

  editComponent = (props, mode = "row") => {
    // Define editor by mode
    const editorByMode = {
      row: () => this.stringEditComponent(props, ''),
      dialog: () => this.codeEditComponent(props)
    };
    // Return editor by mode
    return editorByMode[mode]();
  };

  /**
   * Validate string value
   * @param {*} value
   * @returns
   */
  validate(_value) {
    return Promise.resolve({ success: true });
  }
}

export default StringType;
