import React from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { render, screen, fireEvent } from "@testing-library/react";

export function getRendered(type, props = {}) {
  const Component = type.getEditComponent();
  const Themed = withTheme(Component);
  const { container } = render(<Themed { ...props } />);
  expect(container).toBeInTheDocument();
}

export function testStringInput(DataType, stringValue, realValue) {
  it("Renders correctly", () => {
    getRendered(new DataType());
  });

  it("Set value correctly", () => {
    const onChange = jest.fn();
    getRendered(
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
    getRendered(
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

function validateSuit(type, returns, startIndex = 0) {
  const i = startIndex;

  type.validate({}).then(res => expect(res.success).toBe(returns[i + 0]));
  type.validate([]).then(res => expect(res.success).toBe(returns[i + 1]));
  type.validate(undefined).then(res => expect(res.success).toBe(returns[i + 2]));
  type.validate(null).then(res => expect(res.success).toBe(returns[i + 3]));
  type.validate(false).then(res => expect(res.success).toBe(returns[i + 4]));
  type.validate(true).then(res => expect(res.success).toBe(returns[i + 5]));
  type.validate(3).then(res => expect(res.success).toBe(returns[i + 6]));
  type.validate({a: 1}).then(res => expect(res.success).toBe(returns[i + 7]));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(returns[i + 8]));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(returns[i + 9]));
  type.validate([1]).then(res => expect(res.success).toBe(returns[i + 10]));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(returns[i + 11]));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(returns[i + 12]));

  type.validate("{}").then(res => expect(res.success).toBe(returns[i + 13]));
  type.validate("[]").then(res => expect(res.success).toBe(returns[i + 14]));
  type.validate("").then(res => expect(res.success).toBe(returns[i + 15]));
  type.validate("null").then(res => expect(res.success).toBe(returns[i + 16]));
  type.validate("False").then(res => expect(res.success).toBe(returns[i + 17]));
  type.validate("True").then(res => expect(res.success).toBe(returns[i + 18]));
  type.validate("3").then(res => expect(res.success).toBe(returns[i + 19]));
  type.validate('{"a": 1}').then(res => expect(res.success).toBe(returns[i + 20]));
  type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(returns[i + 21]));
  type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(returns[i + 22]));
  type.validate("[1]").then(res => expect(res.success).toBe(returns[i + 23]));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(returns[i + 24]));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(returns[i + 25]));
}

export function testValidation(DataType, returns, unparsed, parsed, strUnparsed) {
  test("Validation for real objects", () => {
    const type = new DataType({});

    validateSuit(type, returns, 0);

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

    validateSuit(type, returns, 26);

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
