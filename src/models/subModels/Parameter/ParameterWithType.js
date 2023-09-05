import Parameter from "./Parameter";
import schema from "./schema";

class ParameterWithType extends Parameter {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the type property
   * @returns {string}
   */
  getType() {
    return this.type;
  }
}

export default ParameterWithType;
