import React from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { render, screen, fireEvent } from "@testing-library/react";

export function getRendered(type, props = {}) {
  const Component = type.getEditComponent();
  const Themed = withTheme(Component);
  const { container } = render(<Themed { ...props } />);
  expect(container).toBeInTheDocument();
  return container;
}

export function testStringInput(DataType, stringValue, realValue) {
  it("Renders correctly", () => {
    getRendered(new DataType());
  });

  it("Set value correctly", () => {
    const onChange = jest.fn();
    const container = getRendered(
      new DataType(), {
        rowData: { value: [] },
        onChange,
      }
    );
    const input = screen.getByTestId('input_value');
    fireEvent.change(input, { target: { value: stringValue } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(realValue);
  });

  it("Set value correctly (onlyStrings)", () => {
    const onChange = jest.fn();
    const container = getRendered(
      new DataType({ onlyStrings: true }), {
        rowData: { value: [] },
        onChange,
      }
    );
    const input = screen.getByTestId('code-editor-area');
    fireEvent.change(input, { target: { value: stringValue } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(stringValue);
  });
}

export function testValidation(DataType, returns, unparsed, parsed, strUnparsed) {
  test("Validation for real objects", () => {
    const type = new DataType({});

    type.validate({}).then(res => expect(res.success).toBe(returns[0]));
    type.validate([]).then(res => expect(res.success).toBe(returns[1]));
    type.validate(undefined).then(res => expect(res.success).toBe(returns[2]));
    type.validate(null).then(res => expect(res.success).toBe(returns[3]));
    type.validate(false).then(res => expect(res.success).toBe(returns[4]));
    type.validate(true).then(res => expect(res.success).toBe(returns[5]));
    type.validate(3).then(res => expect(res.success).toBe(returns[6]));
    type.validate({a: 1}).then(res => expect(res.success).toBe(returns[7]));
    type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(returns[8]));
    type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(returns[9]));
    type.validate([1]).then(res => expect(res.success).toBe(returns[10]));
    type.validate([[1, 2]]).then(res => expect(res.success).toBe(returns[11]));
    type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(returns[12]));

    type.validate("{}").then(res => expect(res.success).toBe(returns[13]));
    type.validate("[]").then(res => expect(res.success).toBe(returns[14]));
    type.validate("").then(res => expect(res.success).toBe(returns[15]));
    type.validate("null").then(res => expect(res.success).toBe(returns[16]));
    type.validate("False").then(res => expect(res.success).toBe(returns[17]));
    type.validate("True").then(res => expect(res.success).toBe(returns[18]));
    type.validate("3").then(res => expect(res.success).toBe(returns[19]));
    type.validate("{a: 1}").then(res => expect(res.success).toBe(returns[20]));
    type.validate("{a: [1, 2]}").then(res => expect(res.success).toBe(returns[21]));
    type.validate("{a: [1, 2], b: {}}").then(res => expect(res.success).toBe(returns[22]));
    type.validate("[1]").then(res => expect(res.success).toBe(returns[23]));
    type.validate("[[1, 2]]").then(res => expect(res.success).toBe(returns[24]));
    type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(returns[25]));

    if (strUnparsed) {
      expect(type.parsing.parse(unparsed)).toStrictEqual(unparsed);
      expect(type.parsing.unparse(parsed)).toStrictEqual(parsed);
    } else {
      expect(type.parsing.parse(unparsed)).toStrictEqual(parsed);
      expect(type.parsing.unparse(parsed)).toStrictEqual(unparsed);
    }
  });

  test("Validation (onlyStrings)", () => {
    const type = new DataType({ onlyStrings: true });

    type.validate({}).then(res => expect(res.success).toBe(returns[26]));
    type.validate([]).then(res => expect(res.success).toBe(returns[27]));
    type.validate(undefined).then(res => expect(res.success).toBe(returns[28]));
    type.validate(null).then(res => expect(res.success).toBe(returns[29]));
    type.validate(false).then(res => expect(res.success).toBe(returns[30]));
    type.validate(true).then(res => expect(res.success).toBe(returns[31]));
    type.validate(3).then(res => expect(res.success).toBe(returns[32]));
    type.validate({a: 1}).then(res => expect(res.success).toBe(returns[33]));
    type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(returns[34]));
    type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(returns[35]));
    type.validate([1]).then(res => expect(res.success).toBe(returns[36]));
    type.validate([[1, 2]]).then(res => expect(res.success).toBe(returns[37]));
    type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(returns[38]));

    type.validate("{}").then(res => expect(res.success).toBe(returns[39]));
    type.validate("[]").then(res => expect(res.success).toBe(returns[40]));
    type.validate("").then(res => expect(res.success).toBe(returns[41]));
    type.validate("null").then(res => expect(res.success).toBe(returns[42]));
    type.validate("False").then(res => expect(res.success).toBe(returns[43]));
    type.validate("True").then(res => expect(res.success).toBe(returns[44]));
    type.validate("3").then(res => expect(res.success).toBe(returns[45]));
    type.validate('{"a": 1}').then(res => expect(res.success).toBe(returns[46]));
    type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(returns[47]));
    type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(returns[48]));
    type.validate("[1]").then(res => expect(res.success).toBe(returns[49]));
    type.validate("[[1, 2]]").then(res => expect(res.success).toBe(returns[50]));
    type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(returns[51]));
    type.validate("None").then(res => expect(res.success).toBe(returns[52]));

    if (strUnparsed) {
      expect(type.parsing.parse(strUnparsed)).toStrictEqual(parsed);
      expect(type.parsing.unparse(parsed)).toStrictEqual(strUnparsed);
    } else {
      expect(type.parsing.parse(unparsed)).toStrictEqual(unparsed);
      expect(type.parsing.unparse(parsed)).toStrictEqual(parsed);
    }
  });
}
